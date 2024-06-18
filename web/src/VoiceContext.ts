import { createContext } from "react";

type VoiceSetup = {
  voicePreferred: boolean; // e.g. in dingtalk mobile app, we encourage user to use voice
  onStart: () => void;
  onStop: (cancel: boolean) => Promise<string>;
}

export default createContext<VoiceSetup>({
  voicePreferred: false,
  onStart: () => {},
  onStop: () => Promise.resolve('')
});
