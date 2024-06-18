import React from "react"
import { ReplayIcon } from "../components/Icon"

const Header = ({ title, onRestart }) => {

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
      <div className="chat-header-title">{title}</div>
      <div style={restartStyle} onClick={onClick}>
        <ReplayIcon />
      </div>
    </div>
  )
}

export default React.memo(Header)
