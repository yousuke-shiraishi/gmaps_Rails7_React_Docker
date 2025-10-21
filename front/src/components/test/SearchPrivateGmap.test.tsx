import { render, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import SearchPrivateGmap from "../SearchPrivateGmap";
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

describe("SearchPrivateGmap コンポーネント", () => {
  it("必要項目未入力時は検索ボタンが disabled", () => {
    const { getByLabelText, getByRole } = renderWithGmaps(
      <SearchPrivateGmap />
    );
    const button = getByRole("button", { name: "非公開検索" });
    expect(button).toBeDisabled();
    // メール入力のみでは still disabled
    fireEvent.change(getByLabelText("メールアドレス"), {
      target: { value: "a@b.com" },
    });
    expect(button).toBeDisabled();
    // 合言葉も入力すると有効化
    fireEvent.change(getByLabelText("合言葉（magic_word）"), {
      target: { value: "xyz" },
    });
    expect(button).toBeEnabled();
  });

  it("検索成功時に setGmaps が呼ばれデータが更新される", async () => {
    const privateData = [{ id: 10, title: "PrivateMap" }];
    vi.spyOn(api, "post").mockResolvedValueOnce({ data: privateData });
    const { getByLabelText, getByRole, setGmaps } = renderWithGmaps(
      <SearchPrivateGmap />
    );
    fireEvent.change(getByLabelText("メールアドレス"), {
      target: { value: "a@b" },
    });
    fireEvent.change(getByLabelText("合言葉（magic_word）"), {
      target: { value: "abc" },
    });
    fireEvent.click(getByRole("button", { name: "非公開検索" }));
    await waitFor(() => {
      expect(setGmaps).toHaveBeenCalledWith(privateData);
    });
  });

  it("検索失敗時にエラーメッセージが表示される", async () => {
    vi.spyOn(api, "post").mockRejectedValueOnce(new Error("Fail"));
    const { getByLabelText, getByRole, getByText, setGmaps } = renderWithGmaps(
      <SearchPrivateGmap />
    );
    fireEvent.change(getByLabelText("メールアドレス"), {
      target: { value: "a@b" },
    });
    fireEvent.change(getByLabelText("合言葉（magic_word）"), {
      target: { value: "abc" },
    });
    fireEvent.click(getByRole("button", { name: "非公開検索" }));
    await waitFor(() => {
      expect(getByText("検索に失敗しました。")).toBeInTheDocument();
      // setGmaps が呼ばれていないことを確認
      expect(setGmaps).not.toHaveBeenCalled();
    });
  });
});
