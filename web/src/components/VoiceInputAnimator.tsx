import './voice-input-animator.css'

const VoiceInputAnimator = ({ cancel }) => {

  const arr = Array.from({ length: 10 });

  return (
    <div className="voice-input-animator-bar-container">
      {
        arr.map((_, index) => (
          <div key={index} className={`voice-input-animator-bar ${cancel && 'voice-input-animator-bar-cancel'}`}></div>
        ))
      }
    </div>
  )
}

export default VoiceInputAnimator