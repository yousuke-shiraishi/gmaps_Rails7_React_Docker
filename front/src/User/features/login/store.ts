import { configureStore } from "@reduxjs/toolkit";
import loginSlice from "./loginSlice";
import { createLogger } from "redux-logger";

const logger = createLogger({ collapsed: true });

export const store = configureStore({
  reducer: { login: loginSlice.reducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
