import React, { useEffect, useMemo, useState, useContext } from "react";
import { api, V1 } from "../api";
import { Button, TextField, Stack } from "@mui/material";
import GmapsContext from "../components/context/GmapsContext";

type Gmap = {
  id: number;
  title?: string;
  lat?: number;
  lng?: number;
  url?: string;
  [k: string]: any;
};

const authHeaders = () => ({
  "access-token": localStorage.getItem("access-token") || "",
  client: localStorage.getItem("client") || "",
  uid: localStorage.getItem("uid") || "",
});

export default function SearchPublicGmap() {
  const { gmaps, setGmaps } = useContext(GmapsContext);
  const [username, setUsername] = useState("");
  const [birth, setBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // GET /api/v1/gmaps/search_public?username=...
      const { data } = await api.get(`${V1}/gmaps/search_public`, {
        params: { username, birth },
      });
      setGmaps(Array.isArray(data) ? data : (data?.gmaps ?? []));
    } catch (err: any) {
      console.error(err);
      setError("検索に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const disabled = !username || !birth || loading;

  return (
    <div className="p-4 space-y-4">
      {/* 小画面は縦並び、md以上で横並び */}
      <form onSubmit={onSearch}>
        <Stack direction="column" spacing={2}>
          {" "}
          {/* ← 縦に並べる＆余白 */}
          <TextField
            label="名前"
            placeholder="ユーザー名を入力"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            size="small"
            fullWidth
          />
          <TextField
            label="生年月日"
            type="date"
            value={birth}
            onChange={(e) => setBirth(e.target.value)}
            size="small"
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            disableElevation
            disabled={disabled}
            fullWidth // ボタンも幅いっぱいに
            sx={{ height: 40 }}
          >
            {loading ? "検索中..." : "公開検索"}
          </Button>
        </Stack>
      </form>

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
