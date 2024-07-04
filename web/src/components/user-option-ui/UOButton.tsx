import { UOButtonMeta } from './type'
import './uo.css'

const UOButton = ({ meta, onClick }: { meta: UOButtonMeta, onClick: (option: string, action: string) => void }) => {
  return (
    <div className={`uo-button ${meta.action === 'submit' && 'uo-button-submit'}`} onClick={(e) => {
      e.stopPropagation()
      onClick(meta.text, meta.action)
    }}>
      {meta.text}
    </div>
  )
}

export default UOButton;