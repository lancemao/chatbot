import TextArea from 'rc-textarea';
import { UOTextAreaMeta } from './type';
import './uo.css'

const UOTextArea = ({ meta }: { meta: UOTextAreaMeta }) => {

  const onChange = (e: any) => {
    const value = e.target.value
    meta.text = value + '\n'
  }

  return (
    <TextArea autoSize className="uo-textarea" placeholder={meta.placeholder} value={meta.text} onChange={onChange} />
  )
}

export default UOTextArea;