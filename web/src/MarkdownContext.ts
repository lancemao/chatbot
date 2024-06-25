import { createContext } from "react";

interface IMarkdownContext {
  onLinkClick: (e, url: string) => void
}

export default createContext<IMarkdownContext>({
  onLinkClick: () => {}
});
