import React from "react"
import img_user from '@/assets/images/user_profile.svg';
import Markdown from "@/components/Markdown";

const Answer = ({ content }) => {
  return (
    <div className='conversation-content-container'>
      <div className="chat-icon-container">
        <img className="chat-icon" src={img_user} />
      </div>
      <div className="qa-content answer-content">
        <div className="qa-text answer-text">
          <Markdown content={content}></Markdown>
        </div>
      </div>
      <div className="chat-icon-container"></div>
    </div>
  )
}

export default React.memo(Answer)
