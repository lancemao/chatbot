import { UOInputMeta } from './type';
import './uo.css'

const UOInput = ({ meta }: { meta: UOInputMeta }) => {

  const width = meta.width || 100

  const onChange = (e: any) => {
    const value = e.target.value
    meta.text = value
  }

  return (
    <input className="uo-input" style={{ width: width + 'px' }} type="text"
      placeholder={meta.placeholder} value={meta.text} onChange={onChange} />
  )
}

export default UOInput;