import React, { useContext } from "react"

import { ConversationItem } from "@/types/app"

import img_user from '@/assets/images/user_profile.svg';
import AppContext from "@/AppContext";

const Question = ({ item, onDoubleClick }: { item: ConversationItem, onDoubleClick: () => void}) => {

  const { user } = useContext(AppContext)

  const onClick = () => {
    user.onIconClick?.()
  }

  return (
    <div className='conversation-content-container'>
      <div className="chat-icon-container"></div>
      <div className="qa-content question-content" onDoubleClick={onDoubleClick}>
        <div className="qa-text question-text">
          {item.content}
        </div>
      </div>
      <div className="chat-icon-container" onClick={onClick}>
        <img className="chat-icon" src={user?.avatar ?? img_user} />
      </div>
    </div>
  )
}

export default React.memo(Question)
