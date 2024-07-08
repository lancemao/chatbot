import { UOMessageMeta, UOMeta } from "./type";

const UO_PREFIX = '_USER_OPTION_'

export class UOParser {
  static parse(data: string): UOMessageMeta | undefined {
    const trim = data.trim();
    if (trim.startsWith(UO_PREFIX)) {
      const message = JSON.parse(trim.replace(UO_PREFIX, '')) as UOMessageMeta;
      if (message.content) {
        for (const meta of message.content) {
          if (!meta?.id) {
            meta.id = Math.random().toString(36).substring(2, 15);
          }
        }
      }
      return message
    }
  }
}