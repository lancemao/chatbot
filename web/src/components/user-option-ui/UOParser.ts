import { UOMessageMeta } from "./type";

const UO_PREFIX = '_USER_OPTION_'

export class UOParser {
  static parse(data: string): UOMessageMeta | undefined {
    const trim = data.trim();
    if (trim.startsWith(UO_PREFIX)) {
      return JSON.parse(trim.replace(UO_PREFIX, '')) as UOMessageMeta;
    }
  }
}