import React, { useContext } from "react"

import { ConversationItem } from "@/types/app"

import img_user from '@/assets/images/user_profile.svg';
import AppContext from "@/AppContext";

const Question = ({ item, onDoubleClick }: { item: ConversationItem, onDoubleClick: () => void }) => {

  const { user } = useContext(AppContext)

  const onClick = () => {
    user.onIconClick?.()
  }

  const name = user?.nickname ?? user?.username ?? ''

  return (
    <div className='conversation-content-container'>
      <div className="chat-icon-container"></div>
      <div className="qa-content question-content" onDoubleClick={onDoubleClick}>
        <div className="qa-text question-text">
          {item.content}
        </div>
      </div>
      <div className="chat-icon-container" onClick={onClick}>
        {
          user?.avatar ? <img className="chat-icon" src={user?.avatar ? user.avatar : img_user} />
            : name.length > 0 ? <div className="chat-icon-text">{name[0].toLocaleUpperCase()}</div>
              : <img className="chat-icon" src={img_user} />
        }
      </div>
    </div>
  )
}

export default React.memo(Question)
