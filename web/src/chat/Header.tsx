import React from "react"
import { ReplayIcon, RightArrowIcon, SettingIcon } from "../components/Icon"
import { useNavigate } from "react-router-dom";

const Header = ({ title, onRestart }) => {

  const navigate = useNavigate();

  const onTitleClick = () => {
    navigate('/chatx/about');
  }

  const onRestartClick = () => {
    onRestart?.()
  }

  const onSettingClick = () => {
    navigate('/chatx/setting');
  }

  return (
    <div className='chat-header'>
      <div style={{ display: 'flex', alignItems: 'center' }} onClick={onTitleClick}>
        <div className="chat-header-title">{title}</div><RightArrowIcon />
      </div>
      <div className="chat-header-icon-container">
        <div className="chat-header-icon" onClick={onRestartClick}>
          <ReplayIcon />
        </div>
        <div className="chat-header-icon" onClick={onSettingClick}>
          <SettingIcon />
        </div>
      </div>
    </div>
  )
}

export default React.memo(Header)
