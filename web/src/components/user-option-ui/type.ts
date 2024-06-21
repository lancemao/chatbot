// user options defined here
// we will use the meta infomation to create respective components
export enum UOType {
  Button = 'button',
}

export interface UOMeta {
  type: UOType,
}

export interface UOButtonMeta extends UOMeta {
  text: string,
}