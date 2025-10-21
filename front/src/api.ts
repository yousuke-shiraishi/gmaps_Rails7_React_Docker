// src/api.ts
import axios from "axios";

export const ORIGIN =
  import.meta.env.VITE_API_ORIGIN || "http://localhost:8080"; // Nginx経由を推奨
export const API_PREFIX = (import.meta.env.VITE_API_PREFIX ?? "/api").replace(
  /\/$/,
  ""
); // 例: "/api" or ""（Rails直叩き時）

export const V1 = `${API_PREFIX}/v1`;

export const api = axios.create({
  baseURL: ORIGIN, // 8080 のNginx/rails-proxyに合わせる
  headers: { Accept: "application/json" },
});

// トークン設定ユーティリティ
export function setAuthToken(token?: string) {
  if (token) {
    localStorage.setItem("jwt", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("jwt");
    delete api.defaults.headers.common["Authorization"];
  }
}

// 起動時：保存済みトークンを復旧
const saved = localStorage.getItem("jwt");
if (saved) setAuthToken(saved);

// レスポンスで Authorization が来たら保持（Devise-JWT等）
api.interceptors.response.use((res) => {
  const auth = res.headers?.authorization || res.data?.token;
  // 期待ヘッダ名に合わせて調整（例: 'Authorization: Bearer xxxxx'）
  if (typeof auth === "string") {
    const m = auth.match(/^Bearer\s+(.+)$/i);
    setAuthToken(m ? m[1] : auth);
  }
  return res;
});

(api.defaults.headers.get as any) = {
  ...(api.defaults.headers.get || {}),
  "Cache-Control": "no-store",
  Pragma: "no-cache",
  "If-None-Match": "", // ETag ベースの 304 を抑止
  "If-Modified-Since": "0", // Last-Modified ベースの 304 を抑止
};
