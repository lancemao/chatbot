import { createContext } from "react";

export enum VoiceState {
  NA = 'na', // not available
  PREPARING = 'preparing',
  READY = 'ready'
}

type VoiceSetup = {
  voiceState: VoiceState;
  onStart: () => void;
  onStop: (cancel: boolean) => Promise<string>;
}

export default createContext<VoiceSetup>({
  voiceState: VoiceState.NA,
  onStart: () => {},
  onStop: () => Promise.resolve('')
});
