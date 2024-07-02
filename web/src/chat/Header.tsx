import React from "react"
import { ReplayIcon } from "../components/Icon"
import { useNavigate } from "react-router-dom";

const Header = ({ title, onRestart }) => {

  const navigate = useNavigate();

  const restartStyle = {
    paddingRight: '16px',
    height: '100%',
    width: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  }

  const onClick = () => {
    onRestart?.()
  }

  return (
    <div className='chat-header'>
      <div className="chat-header-title" onDoubleClick={() => {
        navigate('/chatx/log');
      }}>{title}</div>
      <div style={restartStyle} onClick={onClick}>
        <ReplayIcon />
      </div>
    </div>
  )
}

export default React.memo(Header)
