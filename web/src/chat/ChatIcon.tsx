import React from "react"

import './chat.css'
import { ConversationItem } from "@/types/app"

const ChatIcon = ({ item }: { item: ConversationItem }) => {
  return (
    <div className='chat-header'>
      <div className="chat-header-title">{item.content}</div>
    </div>
  )
}

export default React.memo(ChatIcon)
