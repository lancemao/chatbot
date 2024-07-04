import { createContext } from "react";

interface IUserOptionContext {
  onMarkdownLinkClick: (e, url: string) => void
  onDatePickerClick: (e, date: string) => Promise<number>
}

export default createContext<IUserOptionContext>({
  onMarkdownLinkClick: () => { },
  onDatePickerClick: () => { return new Promise((resolve) => resolve(0)) },
});
