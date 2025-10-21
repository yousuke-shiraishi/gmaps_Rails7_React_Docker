// loginSlice2.test.ts（修正版）
import { describe, it, expect, vi, beforeAll } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { api } from "../../../api";
import loginSlice, {
  fetchAsyncLogin,
  fetchAsyncRegister,
  fetchAsyncPassWdUpdate,
  fetchAsyncShowUserData,
  logout,
  setTrueMode,
  setFalseMode,
  selectIsLoginView,
  selectProfile,
} from "./loginSlice";

// alert を使う extraReducers があるのでモック
beforeAll(() => vi.stubGlobal("alert", vi.fn()));

const initialState = {
  login: {
    isLoginView: false,
    profile: { id: 0, username: "", email: "", birth: "" },
  },
};

// 共通の store factory（← reducer に { login: loginSlice.reducer } を渡すのがポイント）
const makeStore = (pre = initialState) =>
  configureStore({
    reducer: { login: loginSlice.reducer },
    preloadedState: pre,
  });

describe("loginSlice Thunks and Reducers", () => {
  it("fetchAsyncLogin: 成功で isLoginView を true にする", async () => {
    vi.spyOn(api, "post").mockResolvedValueOnce({ data: { token: "abc" } });
    const store = makeStore();
    const result = await store.dispatch(
      fetchAsyncLogin({ email: "a@b.com", password: "pass" } as any)
    );
    expect(result.type).toBe("login/post/fulfilled");
    expect(store.getState().login.isLoginView).toBe(true);
  });

  it("fetchAsyncLogin: 失敗で rejected", async () => {
    vi.spyOn(api, "post").mockRejectedValueOnce(new Error("error"));
    const store = makeStore();
    const result = await store.dispatch(
      fetchAsyncLogin({ email: "x", password: "y" } as any)
    );
    expect(result.type).toBe("login/post/rejected");
  });

  it("fetchAsyncRegister: 入力不足で rejectWithValue", async () => {
    const store = makeStore();
    const result = await store.dispatch(
      fetchAsyncRegister({
        email: "",
        password: "",
        password_confirmation: "",
      } as any) as any
    );
    expect(result.type).toBe("login/register/rejected");
    expect(result.payload).toBe("必須項目が未入力です");
  });

  it("fetchAsyncRegister: 正常系", async () => {
    vi.spyOn(api, "post").mockResolvedValueOnce({
      data: { id: 2, email: "test@t.com" },
    });
    const store = makeStore();
    const profile = {
      email: "t@t.com",
      password: "p",
      password_confirmation: "p",
      username: "u",
      birth: "2000-01-01",
    } as any;
    const result = await store.dispatch(fetchAsyncRegister(profile) as any);
    expect(result.type).toBe("login/register/fulfilled");
    expect((result as any).payload.id).toBe(2);
  });

  it("fetchAsyncPassWdUpdate: 正常系", async () => {
    vi.spyOn(api, "put").mockResolvedValueOnce({ data: { success: true } });
    const store = makeStore();
    const result = await store.dispatch(
      fetchAsyncPassWdUpdate({
        password: "newpass",
        password_confirmation: "newpass",
      } as any)
    );
    expect(result.type).toBe("login/uppass/fulfilled");
    expect((result as any).payload.success).toBe(true);
  });

  it("fetchAsyncShowUserData: 401 は明示的に reject", async () => {
    const err: any = new Error("Unauthorized");
    err.response = { status: 401 };
    vi.spyOn(api, "get").mockRejectedValueOnce(err);
    const store = makeStore();
    const result = await store.dispatch(fetchAsyncShowUserData() as any);
    expect(result.type).toBe("login/get/rejected");
    expect(result.payload).toBe("未認証です。ログインしてください。");
  });

  it("fetchAsyncShowUserData: 正常系", async () => {
    vi.spyOn(api, "get").mockResolvedValueOnce({
      data: { id: 5, username: "AAA" },
    });
    const store = makeStore();
    const result = await store.dispatch(fetchAsyncShowUserData() as any);
    expect(result.type).toBe("login/get/fulfilled");
    expect((result as any).payload.id).toBe(5);
  });

  it("logout: fulfilled 後に isLoginView=false", async () => {
    const loggedIn = {
      login: {
        isLoginView: true,
        profile: { id: 1, username: "", email: "", birth: "" },
      },
    };
    const store = makeStore(loggedIn);
    const result = await store.dispatch(logout() as any);
    expect(result.type).toBe("logout/delete/fulfilled");
    expect(store.getState().login.isLoginView).toBe(false);
  });

  it("reducers: setTrueMode / setFalseMode", () => {
    // ← 純粋 reducer を直接呼ぶときも slice.reducer を使う
    let state = loginSlice.reducer(initialState.login as any, setTrueMode());
    expect(state.isLoginView).toBe(true);
    state = loginSlice.reducer(state, setFalseMode());
    expect(state.isLoginView).toBe(false);
  });

  it("selectors: selectIsLoginView / selectProfile", () => {
    const state: any = {
      login: { isLoginView: true, profile: { email: "a@b.com" } },
    };
    expect(selectIsLoginView(state)).toBe(true);
    expect(selectProfile(state).email).toBe("a@b.com");
  });
});
