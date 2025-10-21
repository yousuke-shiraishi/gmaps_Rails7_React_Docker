// src/apiClient.ts
import axios from "axios";

// 環境変数からAPIのベースURLを取得（例: http://localhost:3000 など）
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_ORIGIN, // Rails APIの起点URL
  headers: { "Content-Type": "application/json" },
  withCredentials: false, // 認証でCookieを使う場合はtrueに（今回はトークン想定でfalse）
});

export default apiClient;
