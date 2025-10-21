// MainGmaps.tsx
import React, { useEffect, useMemo, useState, useContext } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import type { Libraries } from "@react-google-maps/api";
import { api, V1, setAuthToken } from "../api";
import GmapsContext from "../components/context/GmapsContext";
import GmapFlagContext from "../components/context/GmapFlagContext";
import { Gmap } from "../components/interface/Gmap";

const LIBRARIES: Libraries = ["places"];
const GMAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

const containerStyle = { width: "100%", height: "600px" };
const FALLBACK_CENTER = { lat: 35.454082, lng: 139.49701 };

const MainGmaps: React.FC = () => {
  const { gmaps, setGmaps } = useContext(GmapsContext);
  const { gflag } = useContext(GmapFlagContext);

  const [selected, setSelected] = useState<Gmap | null>(null);
  const [center, setCenter] = useState(FALLBACK_CENTER);
  const [myPos, setMyPos] = useState<{ lat: number; lng: number } | null>(null);

  // ✅ LoadScriptは使わず、これだけ
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GMAPS_KEY,
    libraries: LIBRARIES,
  });

  const TITLE_MAX = 20;

  // 追加: 長文を切って "…" を付ける
  const short = (s?: string | null, n = TITLE_MAX) => {
    const str = s ?? "";
    return str.length > n ? `${str.slice(0, n)}…` : str;
  };

  // 現在地取得（フックは必ず実行される位置に置く）
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const cur = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCenter(cur);
        setMyPos(cur);
      },
      (err) => console.warn("geolocation error:", err),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 }
    );
  }, []);

  // マーカー一覧取得
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`${V1}/gmaps`, {
          headers: { "Cache-Control": "no-store" },
        });
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data?.gmaps ?? res.data?.data ?? []);
        setGmaps(list as Gmap[]);
      } catch (e) {
        console.error("GET /api/v1/gmaps failed", e);
      }
    })();
  }, [gflag, setGmaps]);

  // toAssetUrlは「絶対URLはそのまま返す」ようにして、host差し替えをやめる
  const toAssetUrl = (u?: string | null) => u ?? "";

  const imgUrl = useMemo(
    () => toAssetUrl(selected?.picture_url ?? (selected as any)?.picture ?? ""),
    [selected]
  );

  const wrap = (str: string, n: number) => {
    if (!str || n < 1) return "";
    const a: string[] = [];
    for (let i = 0; i < str.length; i += n) a.push(str.slice(i, i + n));
    return a.join("\n");
  };

  const deleteMarker = async (marker: Gmap) => {
    if (!confirm("本当に削除しますか?削除すると戻せません。")) return;

    const id = Number(marker.id);
    try {
      await api.delete(`${V1}/gmaps/${id}`);

      // 状態から取り除く
      setGmaps((prev) => prev.filter((g) => Number(g.id) !== id));

      // もし選択中なら閉じる（InfoWindowも消える）
      setSelected((s) => (s && Number(s.id) === id ? null : s));

      alert("マーカーを削除しました");
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) alert("未ログインです。再度ログインしてください。");
      else if (status === 404) alert("他人のマーカーは削除できません。");
      else alert("削除に失敗しました。");
    }
  };

  return (
    <>
      {!GMAPS_KEY && (
        <div style={{ padding: 16, color: "crimson" }}>
          VITE_GOOGLE_MAPS_API_KEY が設定されていません（.env と Vite
          再起動を確認）
        </div>
      )}

      {!isLoaded ? (
        <div>Loading...</div>
      ) : (
        <GoogleMap
          key={`${center.lat},${center.lng}`}
          mapContainerStyle={containerStyle}
          zoom={8}
          center={center}
          onClick={() => setSelected(null)}
        >
          {myPos && (
            <Marker
              position={myPos}
              icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
              title="現在地"
            />
          )}

          {Array.isArray(gmaps) &&
            gmaps.map((m) => (
              <Marker
                key={m.id}
                position={{ lat: m.latitude, lng: m.longitude }}
                onMouseOver={() => setSelected(m)}
              />
            ))}
          {selected && (
            <InfoWindow
              key={`${selected.id}-${imgUrl}`} // ← これで切替ごとに再マウント
              position={{ lat: selected.latitude, lng: selected.longitude }}
              onCloseClick={() => setSelected(null)}
            >
              <div style={{ maxWidth: 260 }}>
                {imgUrl && (
                  <a href={imgUrl} target="_blank" rel="noreferrer">
                    <img
                      key={imgUrl}
                      src={imgUrl}
                      width={150}
                      style={{
                        display: "block",
                        maxWidth: "100%",
                        height: "auto",
                      }}
                      alt=""
                      onError={(e) => {
                        console.warn("image load failed:", imgUrl);
                        // display:none はやめる。代替表示に切り替える
                        (e.currentTarget as HTMLImageElement).replaceWith(
                          Object.assign(document.createElement("div"), {
                            textContent: "画像を読み込めませんでした",
                            style: "padding:4px 0;color:#888;font-size:12px;",
                          })
                        );
                      }}
                    />
                  </a>
                )}
                <p style={{ margin: "8px 0 4px" }}>{short(selected.title)}</p>
                <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                  {wrap(selected.comment || "", 30)}
                </p>
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => deleteMarker(selected)}>
                    マーカーを削除する
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      )}
    </>
  );
};

export default MainGmaps;
