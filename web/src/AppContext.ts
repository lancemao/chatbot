import { createContext } from "react";
import User from "./sso/User";
import { AppInfo } from "./types/app";

type AppContent = {
  user: User;
  setUser: (user: User) => void;
  appInfo: AppInfo | undefined;
  setAppInfo: (appInfo: AppInfo) => void;
}

export default createContext<AppContent>({
  user: User.Guest,
  setUser: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  appInfo: undefined,
  setAppInfo: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
});
