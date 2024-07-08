import TextArea from 'rc-textarea';
import { UOTextAreaMeta } from './type';
import './uo.css'

const UOTextArea = ({ meta, onTextAreaChange }: { meta: UOTextAreaMeta, onTextAreaChange }) => {

  const onChange = (e: any) => {
    const value = e.target.value
    meta.text = value
    onTextAreaChange?.(meta)
  }

  return (
    <TextArea autoSize className={`uo-textarea ${meta.error && 'uo-textarea-error'}`} placeholder={meta.placeholder} value={meta.text} onChange={onChange} />
  )
}

export default UOTextArea;