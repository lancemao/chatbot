import './uo.css'

const UOButton = ({ text, onClick }: { text: string, onClick: (option: string) => void }) => {
  return (
    <div className="uo-button" onClick={() => onClick(text)}>
      {text}
    </div>
  )
}

export default UOButton;