import { UOTextMeta } from './type';
import './uo.css'

const UOText = ({ meta }: { meta: UOTextMeta }) => {
  return (
    <span className="uo-text">
      {meta.text}
    </span>
  )
}

export default UOText;