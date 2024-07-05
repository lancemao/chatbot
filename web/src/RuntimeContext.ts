import { createContext } from "react";

interface IRuntimeContext {
  location: string
  onMarkdownLinkClick: (e, url: string) => void
  onDatePickerClick: (e, date: string) => Promise<number>
}

export default createContext<IRuntimeContext>({
  location: '',
  onMarkdownLinkClick: () => { },
  onDatePickerClick: () => { return new Promise((resolve) => resolve(0)) },
});
