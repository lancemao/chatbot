import React from "react"
import { ReplayIcon, RightArrowIcon } from "../components/Icon"
import { useNavigate } from "react-router-dom";

const Header = ({ title, onRestart }) => {

  const navigate = useNavigate();

  const restartStyle = {
    height: '100%',
    width: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  }

  const onTitleClick = () => {
    navigate('/chatx/about');
  }

  const onRestartClick = () => {
    onRestart?.()
  }

  return (
    <div className='chat-header'>
      <div style={{ display: 'flex', alignItems: 'center' }} onClick={onTitleClick}>
        <div className="chat-header-title">{title}</div><RightArrowIcon />
      </div>
      <div style={restartStyle} onClick={onRestartClick}>
        <ReplayIcon />
      </div>
    </div>
  )
}

export default React.memo(Header)
