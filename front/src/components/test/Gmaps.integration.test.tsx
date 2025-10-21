import { vi, describe, it, beforeEach, expect } from "vitest";
import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// 1) mocks は SUT import より「前」に宣言
vi.mock("@react-google-maps/api", () => ({
  useJsApiLoader: () => ({ isLoaded: true }),
  GoogleMap: ({ children }: any) => (
    <div data-testid="google-map">{children}</div>
  ),
  Marker: ({ onMouseOver }: any) => (
    <div data-testid="marker" onMouseOver={onMouseOver} />
  ),
  InfoWindow: ({ children }: any) => (
    <div data-testid="info-window">{children}</div>
  ),
}));

// ★ここを "../src/api" ではなく "../../api" に
vi.mock("../../api", () => ({
  api: { post: vi.fn(), get: vi.fn() },
  V1: "/api/v1",
  setAuthToken: vi.fn(),
}));

// 2) SUT import
import CreateGmaps from "../../components/CreateGmaps";
import MainGmaps from "../../gmaps_parts/MainGmaps";
import GmapsContext from "../../components/context/GmapsContext";
import GmapFlagContext from "../../components/context/GmapFlagContext";
import { api } from "../../api";

const AppWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [gmaps, setGmaps] = React.useState<any[]>([]);
  const [gflag, setGflag] = React.useState(0);
  return (
    <GmapFlagContext.Provider value={{ gflag, setGflag } as any}>
      <GmapsContext.Provider value={{ gmaps, setGmaps } as any}>
        {children}
      </GmapsContext.Provider>
    </GmapFlagContext.Provider>
  );
};

beforeEach(() => {
  vi.restoreAllMocks();

  // 3) geolocation を JSDOM に生やす（spyOn しない）
  Object.defineProperty(global.navigator, "geolocation", {
    value: {
      getCurrentPosition: vi.fn((ok: any) =>
        ok({ coords: { latitude: 35, longitude: 139 } })
      ),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    },
    configurable: true,
    writable: true,
  });

  // Main の初回 GET は空
  (api.get as any).mockResolvedValueOnce({ data: [] });
});

describe("CreateGmaps + MainGmaps (integration)", () => {
  it("作成→再取得→Main に反映、InfoWindow でタイトル/コメントが見える", async () => {
    // POST 成功
    (api.post as any).mockResolvedValue({ data: { id: 2 } });

    // 作成後の GET（MainGmaps 内の再取得）で 1件返す
    (api.get as any).mockResolvedValueOnce({
      data: [
        {
          id: 2,
          latitude: 35.2,
          longitude: 139.3,
          title: "新規タイトルめっちゃ長いけどshortされるはず",
          comment: "新規コメント本文",
          picture_url: "",
        },
      ],
    });

    render(
      <AppWrapper>
        <CreateGmaps />
        <MainGmaps />
      </AppWrapper>
    );

    // Create 側：入力→送信
    await userEvent.type(
      screen.getByRole("textbox", { name: /タイトル/ }),
      "新規タイトルめっちゃ長いけどshortされるはず"
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: /コメント/ }),
      "新規コメント本文"
    );
    await userEvent.click(
      screen.getByRole("button", { name: /作成する|作成|送信|登録/ })
    );

    // 成功メッセージ（CreateGmaps 実装は「作成しました（id: …）。」）
    expect(
      await screen.findByText(/作成しました|成功|作成に成功/i)
    ).toBeInTheDocument();

    // Main 側：Marker は「現在地」と「gmaps」の 2 個出るので、最後の（= gmaps 側）に hover
    const markers = await screen.findAllByTestId("marker");
    const gmapsMarker = markers.at(-1)!;
    await userEvent.hover(gmapsMarker);

    // InfoWindow の中身を検証
    const info = await screen.findByTestId("info-window");
    const scope = within(info);
    expect(await scope.findByText(/新規タイトル/)).toBeInTheDocument();
    expect(scope.getByText(/新規コメント本文/)).toBeInTheDocument();
  });
});
