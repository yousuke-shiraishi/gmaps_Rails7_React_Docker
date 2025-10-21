// SwitchingSearch.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import SwitchingSearch from "../SwitchingSearch";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

// ---- 子コンポーネントはダミーにする ----
vi.mock("../SearchPublicGmap", () => ({
  default: () => <div>SearchPublicGmap Component</div>,
}));
vi.mock("../SearchPrivateGmap", () => ({
  default: () => <div>SearchPrivateGmap Component</div>,
}));
vi.mock("../CreateGmaps", () => ({
  default: () => <div>CreateGmaps Component</div>,
}));

// ---- テスト用の最小 Redux store ----
// loginSlice の selector は実行時に state.login.isLoginView を読むだけなので
// ここで同じ形の state を作れば OK
const makeStore = (isLoginView: boolean) =>
  configureStore({
    reducer: {
      login: (state = { isLoginView }) => state,
    },
    preloadedState: { login: { isLoginView } },
  });

const renderWithStore = (isLoginView: boolean) => {
  const store = makeStore(isLoginView);
  return render(
    <Provider store={store}>
      <SwitchingSearch />
    </Provider>
  );
};

describe("SwitchingSearch コンポーネント", () => {
  beforeEach(() => vi.clearAllMocks());

  it("未ログイン時: 「マップを作成」ラジオが表示されない", () => {
    renderWithStore(false);

    expect(screen.getByLabelText("マップ検索")).toBeInTheDocument();
    expect(screen.queryByLabelText("マップを作成")).not.toBeInTheDocument();
  });

  it("ログイン済み時: 「マップを作成」ラジオが表示される", () => {
    renderWithStore(true);

    expect(screen.getByLabelText("マップ検索")).toBeInTheDocument();
    expect(screen.getByLabelText("マップを作成")).toBeInTheDocument();
  });

  it("「マップ検索」を選ぶと公開/非公開の選択肢が出て、公開を選ぶと SearchPublicGmap が表示される", async () => {
    renderWithStore(true);

    fireEvent.click(screen.getByLabelText("マップ検索"));

    await waitFor(() => {
      expect(
        screen.getByLabelText("公開されているマップ検索")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("公開されないマップ検索")
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("公開されているマップ検索"));

    await waitFor(() => {
      expect(
        screen.getByText("SearchPublicGmap Component")
      ).toBeInTheDocument();
    });
  });

  it("「マップ検索」後に非公開を選ぶと SearchPrivateGmap が表示される", async () => {
    renderWithStore(true);

    fireEvent.click(screen.getByLabelText("マップ検索"));

    await waitFor(() => {
      expect(
        screen.getByLabelText("公開されているマップ検索")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("公開されないマップ検索")
      ).toBeInTheDocument();
    });

    const privateRadio = screen.getByLabelText("公開されないマップ検索");
    fireEvent.click(privateRadio);

    await waitFor(() => {
      expect(privateRadio).toBeChecked();
      expect(
        screen.getByText("SearchPrivateGmap Component")
      ).toBeInTheDocument();
    });
  });

  it("初期状態（searchGmap=false）では CreateGmaps が表示される", () => {
    renderWithStore(true);
    expect(screen.getByText("CreateGmaps Component")).toBeInTheDocument();
  });

  it("ログイン済みで「マップを作成」を選ぶと CreateGmaps が表示される", async () => {
    renderWithStore(true);

    fireEvent.click(screen.getByLabelText("マップを作成"));

    await waitFor(() => {
      expect(screen.getByText("CreateGmaps Component")).toBeInTheDocument();
    });
  });
});
