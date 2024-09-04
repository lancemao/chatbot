import { createContext } from "react";
import User from "./sso/User";
import { AppInfo } from "./types/app";
import { Log } from "./log/Log";

type AppContent = {
  isPC: boolean;
  user: User;
  setUser: (user: User) => void;
  appInfo: AppInfo | undefined;
  setAppInfo: (appInfo: AppInfo) => void;
  logs: Log[];
  addLog: (log: Log) => void;
}

export default createContext<AppContent>({
  isPC: false,
  user: User.Guest,
  setUser: () => {},
  appInfo: undefined,
  setAppInfo: () => {},
  logs: [],
  addLog: () => {},
});
