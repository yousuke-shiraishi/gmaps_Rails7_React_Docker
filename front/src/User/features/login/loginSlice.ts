// src/front/features/login/loginSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api, V1, setAuthToken } from "../../../api";
import { Profile } from "../../../components/interface/Profile";
import { UpdatePW } from "../../../components/interface/UpdatePW";
import type { RootState } from "./store";

export const fetchAsyncLogin = createAsyncThunk(
  "login/post",
  async (auth: Profile) => {
    // Devise: POST /users/sign_in
    const res = await api.post("/users/sign_in", {
      user: { email: auth.email, password: auth.password },
    });
    // interceptor が Authorization を拾って localStorage へ保存し、
    // api.defaults.headers.common['Authorization'] にも載せる想定。
    return res.data;
  }
);

export const fetchAsyncRegister = createAsyncThunk(
  "login/register",
  async (profile: Profile, { rejectWithValue }) => {
    const { email, password, password_confirmation, username, birth } = profile;
    if (!email || !password || !password_confirmation) {
      return rejectWithValue("必須項目が未入力です");
    }
    try {
      const res = await api.post(
        "/users",
        {
          user: {
            email,
            password,
            password_confirmation,
            username: username ?? "",
            birth: birth ?? "",
          },
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      return res.data;
    } catch (e: any) {
      const msg =
        e?.response?.data?.errors?.join("\n") ||
        e?.response?.data?.error ||
        e?.message ||
        "登録に失敗しました";
      return rejectWithValue(msg);
    }
  }
);

export const fetchAsyncUpdate = createAsyncThunk(
  "login/put",
  async (profile: Profile) => {
    const res = await api.put("/users", {
      user: {
        username: profile.username,
        email: profile.email,
        birth: profile.birth,
      },
    });
    return res.data;
  }
);

export const fetchAsyncShowUserData = createAsyncThunk(
  "login/get",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`${V1}/users/current_user`);
      return res.data;
    } catch (e: any) {
      // 未ログイン（401）は明示的に扱えるとデバッグしやすい
      if (e?.response?.status === 401) {
        return rejectWithValue("未認証です。ログインしてください。");
      }
      throw e;
    }
  }
);

export const logout = createAsyncThunk("logout/delete", async () => {
  setAuthToken(undefined);
});

export const fetchAsyncPassWdUpdate = createAsyncThunk(
  "login/uppass",
  async (editAuth: UpdatePW) => {
    const res = await api.put("/users/password", {
      user: {
        password: editAuth.password,
        password_confirmation: editAuth.password_confirmation,
      },
    });
    return res.data;
  }
);

const loginSlice = createSlice({
  name: "login",
  initialState: {
    isLoginView: false,
    profile: {
      id: 0,
      username: "",
      email: "",
      birth: "",
      password: "",
      password_confirmation: "",
    } as Profile,
  },
  reducers: {
    setTrueMode(state) {
      state.isLoginView = true;
    },
    setFalseMode(state) {
      state.isLoginView = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAsyncShowUserData.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(fetchAsyncShowUserData.rejected, (_, action: any) => {
        if (action.payload) alert(action.payload); // 401 等のメッセージ
      })
      .addCase(fetchAsyncUpdate.fulfilled, (state, action) => {
        state.profile = action.payload;
        alert("ユーザー情報を更新しました。");
      })
      .addCase(fetchAsyncPassWdUpdate.fulfilled, () => {
        alert("パスワードを更新しました。");
      })
      .addCase(fetchAsyncLogin.fulfilled, (state) => {
        state.isLoginView = true;
        alert("ログインしました。");
      })
      .addCase(fetchAsyncLogin.rejected, () => {
        alert("ログイン失敗");
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoginView = false;
        alert("ログアウトしました。");
      });
  },
});

export const { setTrueMode, setFalseMode } = loginSlice.actions;
export const selectAuthen = (state: RootState) => state.login.profile;
export const selectIsLoginView = (state: RootState) => state.login.isLoginView;
export const selectProfile = (state: RootState) => state.login.profile;
export default loginSlice;
