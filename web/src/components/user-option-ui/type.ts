// user options defined here
// we will use the meta infomation to create respective components
export enum UOType {
  Text = 'text',
  Button = 'button',
  Input = 'input',
  TextArea = 'textarea',
}

export interface UOMeta {
  type: UOType,
  width?: number,
  height?: number
  text?: string,
}

export interface UOTextMeta extends UOMeta {
  text: string,
}

export interface UOButtonMeta extends UOTextMeta {
  action: string
}

export interface UOInputMeta extends UOTextMeta {
  placeholder: string,
}

export interface UOTextAreaMeta extends UOInputMeta {
}

export interface UOMessageMeta {
  header?: { title: string, description?: string },
  content?: UOMeta[],
  options?: UOMeta[],
}
