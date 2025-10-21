import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { describe, it, expect } from "vitest";
import Header from "../Header";

// MemoryRouterとProviderでラップするヘルパー関数
const renderWithState = (isLoginView: boolean) => {
  const store = configureStore({
    reducer: {
      login: () => ({ isLoginView }),
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    </Provider>
  );
};

describe("Header コンポーネント", () => {
  describe("未ログイン時", () => {
    it("「ログイン」「Register」が表示される", () => {
      renderWithState(false);

      expect(screen.getByText("ログイン")).toBeInTheDocument();
      expect(screen.getByText("Register")).toBeInTheDocument();
    });

    it("ログイン済み専用のリンクは表示されない", () => {
      renderWithState(false);

      expect(screen.queryByText("検索＆作成")).not.toBeInTheDocument();
      expect(screen.queryByText("ログアウト")).not.toBeInTheDocument();
      expect(screen.queryByText("プロフィールの変更")).not.toBeInTheDocument();
      expect(screen.queryByText("パスワードの変更")).not.toBeInTheDocument();
    });

    it("正しいリンク先が設定されている", () => {
      renderWithState(false);

      const loginLink = screen.getByText("ログイン").closest("a");
      const registerLink = screen.getByText("Register").closest("a");

      expect(loginLink).toHaveAttribute("href", "/login");
      expect(registerLink).toHaveAttribute("href", "/register");
    });
  });

  describe("ログイン済み時", () => {
    it("検索・ログアウトなどのリンクが表示される", () => {
      renderWithState(true);

      expect(screen.getByText("検索＆作成")).toBeInTheDocument();
      expect(screen.getByText("ログアウト")).toBeInTheDocument();
      expect(screen.getByText("プロフィールの変更")).toBeInTheDocument();
      expect(screen.getByText("パスワードの変更")).toBeInTheDocument();
    });

    it("未ログイン専用のリンクは表示されない", () => {
      renderWithState(true);

      expect(screen.queryByText("ログイン")).not.toBeInTheDocument();
      expect(screen.queryByText("Register")).not.toBeInTheDocument();
    });

    it("正しいリンク先が設定されている", () => {
      renderWithState(true);

      const searchLink = screen.getByText("検索＆作成").closest("a");
      const logoutLink = screen.getByText("ログアウト").closest("a");
      const profileLink = screen.getByText("プロフィールの変更").closest("a");
      const passwdLink = screen.getByText("パスワードの変更").closest("a");

      expect(searchLink).toHaveAttribute("href", "/");
      expect(logoutLink).toHaveAttribute("href", "/logout");
      expect(profileLink).toHaveAttribute("href", "/update_profile");
      expect(passwdLink).toHaveAttribute("href", "/update_passwd");
    });
  });

  describe("アクセシビリティ", () => {
    it("すべてのリンクが適切なテキストを持つ", () => {
      renderWithState(true);

      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link.textContent).toBeTruthy();
        expect(link.textContent?.trim().length).toBeGreaterThan(0);
      });
    });
  });
});
