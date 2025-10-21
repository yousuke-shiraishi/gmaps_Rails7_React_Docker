import React, { useEffect, useState, useContext } from "react";
import { api, V1 } from "../api";
import GmapsContext from "../components/context/GmapsContext";
import GmapFlagContext from "../components/context/GmapFlagContext";
import { Gmap } from "../components/interface/Gmap";

import { Box, Grid, Stack, TextField, Button, Typography } from "@mui/material";

type CreatePayload = {
  title: string;
  latitude?: number | null;
  longitude?: number | null;
  comment?: string | null;
  magicWord?: string | null;
};

export default function CreateGmaps() {
  const { gmaps, setGmaps } = useContext(GmapsContext);
  const [title, setTitle] = useState("");
  const [lat, setLat] = useState(""); // 入力は string
  const [lng, setLng] = useState("");
  const [comment, setComment] = useState("");
  const [magicWord, setMagicWord] = useState(""); // 非公開用の合言葉（任意）
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const fillWithGeolocation = () => {
    if (!("geolocation" in navigator)) {
      setError("このブラウザは位置情報に対応していません。");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude));
        setLng(String(pos.coords.longitude));
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        const msg =
          err.code === err.PERMISSION_DENIED
            ? "位置情報の利用が拒否されました。ブラウザのサイト設定から許可してください。"
            : err.code === err.POSITION_UNAVAILABLE
              ? "位置情報を取得できませんでした。"
              : "位置情報の取得に失敗しました。";
        setError(msg);
        console.warn("geolocation error:", err);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    fillWithGeolocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const payload: CreatePayload = {
        title: title.trim(),
        latitude: lat ? parseFloat(lat) : null,
        longitude: lng ? parseFloat(lng) : null,
        comment: comment.trim() || null,
        magicWord: magicWord.trim() || null,
      };

      const fd = new FormData();
      // Rails の strong params に合わせて "gmap[...]" で積む
      fd.append("gmap[title]", payload.title);
      if (payload.comment) fd.append("gmap[comment]", payload.comment);
      if (payload.magicWord) fd.append("gmap[magic_word]", payload.magicWord); // ← snake_case
      if (payload.latitude !== null && !Number.isNaN(payload.latitude)) {
        fd.append("gmap[lat]", String(payload.latitude));
      }
      if (payload.longitude !== null && !Number.isNaN(payload.longitude)) {
        fd.append("gmap[lng]", String(payload.longitude));
      }
      if (file) {
        fd.append("gmap[picture]", file);
      }

      // multipart/form-data で送信
      const { data } = await api.post(`${V1}/gmaps`, fd);

      setMessage(`作成しました（id: ${data?.id ?? "不明"}）。`);
      setTitle("");
      setLat("");
      setLng("");
      setComment("");
      setMagicWord("");
      setFile(null);
      if (typeof (api as any).get === "function") {
        const res = await (api as any).get(`${V1}/gmaps`, {
          headers: { "Cache-Control": "no-store" },
        });
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data?.gmaps ?? res.data?.data ?? []);
        setGmaps(list as Gmap[]);
      }
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.errors?.join("\n") ??
        err?.response?.data?.error ??
        (err?.response?.status != null ? String(err.response.status) : null) ??
        err?.message ??
        "作成に失敗しました。";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box p={2}>
      <Box
        component="form"
        onSubmit={onSubmit}
        encType="multipart/form-data"
        sx={{ display: "block" }}
      >
        <Grid container spacing={2}>
          {/* タイトル */}
          <Grid size={12}>
            <TextField
              label="タイトル"
              placeholder="タイトル"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
              size="small"
            />
          </Grid>

          {/* コメント */}
          <Grid size={12}>
            <TextField
              label="コメント（必須）"
              placeholder="コメント（必須）"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              fullWidth
              multiline
              minRows={3}
            />
          </Grid>

          {/* 合言葉 */}
          <Grid size={12}>
            <TextField
              label="合言葉（任意・入力すると非公開検索に必要）"
              value={magicWord}
              onChange={(e) => setMagicWord(e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>

          {/* 緯度・経度・現在地 */}
          <Grid size={12}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="緯度 (例: 35.68)"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                fullWidth
                size="small"
              />
              <TextField
                label="経度 (例: 139.76)"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                fullWidth
                size="small"
              />
              <Button
                type="button"
                variant="contained"
                color="inherit"
                onClick={fillWithGeolocation}
                disabled={locating}
                sx={{ whiteSpace: "nowrap", flexShrink: 0, height: 40 }}
              >
                {locating ? "取得中…" : "現在地"}
              </Button>
            </Stack>
          </Grid>

          {/* 画像アップロード */}
          <Grid size={12}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button component="label" variant="outlined">
                画像を選択
                <input
                  type="file"
                  name="gmap[picture]"
                  hidden
                  data-testid="gmaps-file"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </Button>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {file ? file.name : "選択されていません"}
              </Typography>
            </Stack>
          </Grid>

          {/* 送信ボタン */}
          <Grid size={12}>
            <Button
              type="submit"
              variant="contained"
              color="success"
              disableElevation
              disabled={submitting || !title.trim() || !comment.trim()}
              sx={{ height: 40, minWidth: 160 }}
            >
              {submitting ? "作成中..." : "作成する"}
            </Button>
          </Grid>
        </Grid>
      </Box>
      {message && <p className="text-green-700 text-sm">{message}</p>}
      {error && (
        <p className="text-red-600 text-sm whitespace-pre-wrap">{error}</p>
      )}
    </Box>
  );
}
