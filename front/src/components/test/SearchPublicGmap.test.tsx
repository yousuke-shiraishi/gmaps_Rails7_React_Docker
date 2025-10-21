import { render, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import SearchPublicGmap from "../SearchPublicGmap";
import GmapsContext from "../context/GmapsContext";
import { api } from "../../api";

const renderWithGmaps = (ui: React.ReactElement) => {
  const setGmaps = vi.fn();
  const renderResult = render(
    <GmapsContext.Provider value={{ gmaps: [], setGmaps }}>
      {ui}
    </GmapsContext.Provider>
  );
  return { ...renderResult, setGmaps };
};

describe("SearchPublicGmap コンポーネント", () => {
  it("必要項目未入力時は検索ボタンが disabled", () => {
    const { getByLabelText, getByRole } = renderWithGmaps(<SearchPublicGmap />);
    const button = getByRole("button", { name: "公開検索" });
    expect(button).toBeDisabled();
    // 名前のみ入力しても disabled
    fireEvent.change(getByLabelText("名前"), {
      target: { value: "user" },
    });
    expect(button).toBeDisabled();
    // 生年月日のみ（すでに名前入力済）ボタン有効化
    fireEvent.change(getByLabelText("生年月日"), {
      target: { value: "2000-01-01" },
    });
    expect(button).toBeEnabled();
  });

  it("検索成功時に setGmaps が呼ばれる", async () => {
    const publicData = [{ id: 20, title: "PublicMap" }];
    vi.spyOn(api, "get").mockResolvedValueOnce({ data: publicData });
    const { getByLabelText, getByRole, setGmaps } = renderWithGmaps(
      <SearchPublicGmap />
    );
    fireEvent.change(getByLabelText("名前"), {
      target: { value: "user" },
    });
    fireEvent.change(getByLabelText("生年月日"), {
      target: { value: "2000-01-01" },
    });
    fireEvent.click(getByRole("button", { name: "公開検索" }));
    await waitFor(() => {
      // setGmaps がAPI応答データで呼び出されることを確認
      expect(setGmaps).toHaveBeenCalledWith(publicData);
    });
  });

  it("検索失敗時にエラーメッセージが表示される", async () => {
    vi.spyOn(api, "get").mockRejectedValueOnce(new Error("Fail"));
    const { getByLabelText, getByRole, getByText } = renderWithGmaps(
      <SearchPublicGmap />
    );
    fireEvent.change(getByLabelText("名前"), {
      target: { value: "user" },
    });
    fireEvent.change(getByLabelText("生年月日"), {
      target: { value: "2000-01-01" },
    });
    fireEvent.click(getByRole("button", { name: "公開検索" }));
    await waitFor(() => {
      expect(getByText("検索に失敗しました。")).toBeInTheDocument();
    });
  });
});
