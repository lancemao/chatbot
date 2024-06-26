import React from "react"
import img_user from '@/assets/images/user_profile.svg';
import Markdown from "@/components/Markdown";
import { UOButtonMeta, UOMeta, UOType } from "@/components/user-option-ui/type";
import { ConversationItem } from "@/types/app";
import UOButton from "@/components/user-option-ui/UOButton";
import { useNavigate } from "react-router-dom";

const Answer = ({ item, onUserOption }: { item: ConversationItem, onUserOption?: any }) => {

  const navigate = useNavigate();
  
  return (
    <div className='conversation-content-container'>
      <div className="chat-icon-container">
        <img className="chat-icon" src={img_user} />
      </div>
      <div className="qa-content answer-content" onDoubleClick={() => {
        navigate('/chatx/answer-detail', {state: item});
      }}>
        <div className="qa-text answer-text">
          {
            item.id === 'error' ?
              <div className="answer-text-error">{item.content}</div>
              : <Markdown content={item.content}></Markdown>
          }
          {
            item.meta?.map((meta: UOMeta, index) => {
              return <div key={index}>
                {
                  meta.type === UOType.Button &&
                  <UOButton text={(meta as UOButtonMeta).text} onClick={(option) => {
                    onUserOption?.(option)
                  }} />
                }
              </div>
            })
          }
        </div>
      </div>
      <div className="chat-icon-container"></div>
    </div>
  )
}

export default React.memo(Answer)
