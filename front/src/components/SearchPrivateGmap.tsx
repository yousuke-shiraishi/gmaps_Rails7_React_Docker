import React, { useEffect, useMemo, useState, useContext } from "react";
import { api, V1 } from "../api";
import { Stack, TextField, Button } from "@mui/material";
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

export default function SearchPrivateGmap() {
  const { gmaps, setGmaps } = useContext(GmapsContext);
  const [email, setEmail] = useState("");
  const [magicWord, setMagicWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Gmap[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // POST /api/v1/gmaps/search_private  （body JSONで送る）
      const { data } = await api.post(`${V1}/gmaps/search_private`, null, {
        params: { email, magic_word: magicWord },
      });
      setGmaps(Array.isArray(data) ? data : (data?.gmaps ?? []));
    } catch (err: any) {
      console.error(err);
      setError("検索に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <form onSubmit={onSearch}>
        <Stack direction="column" spacing={2}>
          <TextField
            label="メールアドレス"
            placeholder="メールアドレス"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="small"
            fullWidth
          />

          <TextField
            label="合言葉（magic_word）"
            placeholder="合言葉（magic_word）"
            value={magicWord}
            onChange={(e) => setMagicWord(e.target.value)}
            size="small"
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            disableElevation
            disabled={!email || !magicWord || loading}
            fullWidth
            sx={{ height: 40 }}
          >
            {loading ? "検索中..." : "非公開検索"}
          </Button>
        </Stack>
      </form>
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <ul className="space-y-2">
        {results.map((g) => (
          <li key={g.id} className="border rounded p-3">
            <div className="font-semibold">{g.title ?? `#${g.id}`}</div>
            <div className="text-sm opacity-80">
              lat: {g.lat ?? "-"}, lng: {g.lng ?? "-"}
            </div>
            {g.url && (
              <a
                className="text-blue-600 underline text-sm"
                href={g.url}
                target="_blank"
                rel="noreferrer"
              >
                開く
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
