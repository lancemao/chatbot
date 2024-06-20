import { StopIcon } from "../components/Icon"

const StopRespondingButton = ({ responding, onClick }) => {
  return (
    <>
      {
        responding &&
        <div className="stop-responding-area">
          <div className="stop-responding-container" onClick={onClick}>
            <StopIcon className="stop-responding-icon" width={24} height={24} />
            <div className="stop-responding-text">停止响应</div>
          </div>
        </div>
      }
    </>
  )
}

export default StopRespondingButton;
