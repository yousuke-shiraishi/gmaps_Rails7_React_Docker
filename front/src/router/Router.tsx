import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";

// Pages
import Login from "../User/Login";
import Register from "../User/Register";
import UpdateProfile from "../User/UpdateProfile";
import UpdatePassWord from "../User/AuthUpdate";
import Logout from "../User/Logout";
import NotFoundPage from "../components/pages/Page404";

// Common layout
import Header from "../components/Header";

// GMaps
import MainGmaps from "../gmaps_parts/MainGmaps";
import SwitchingSearch from "../components/SwitchingSearch";

// Contexts & types
import GmapFlagContext from "../components/context/GmapFlagContext";
import GmapsContext from "../components/context/GmapsContext";
import { Gmap } from "../components/interface/Gmap";

const AppRouter: React.FC = () => {
  const [gflag, setGmapFlag] = useState<boolean>(false);
  const [gmaps, setGmaps] = useState<Gmap[]>([]);

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <GmapsContext.Provider value={{ gmaps, setGmaps }}>
        <GmapFlagContext.Provider value={{ gflag, setGmapFlag }}>
          <Grid container spacing={2}>
            {/* 共通ヘッダー */}
            <Grid size={12}>
              <Header />
            </Grid>

            {/* 各ページ */}
            <Grid size={12}>
              <Routes>
                {/* トップ：地図 + 検索 */}
                <Route
                  path="/"
                  element={
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 8 }}>
                        <MainGmaps />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <SwitchingSearch />
                      </Grid>
                    </Grid>
                  }
                />

                {/* 認証系 */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/update_profile" element={<UpdateProfile />} />
                <Route path="/update_passwd" element={<UpdatePassWord />} />
                <Route path="/logout" element={<Logout />} />

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Grid>
          </Grid>
        </GmapFlagContext.Provider>
      </GmapsContext.Provider>
    </Container>
  );
};

export default AppRouter;
