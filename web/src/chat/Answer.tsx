import React from "react"
import img_user from '@/assets/images/user_profile.svg';
import Markdown from "@/components/Markdown";
import { UOButtonMeta, UOMeta, UOType } from "@/components/user-option-ui/type";
import { ConversationItem } from "@/types/app";
import UOButton from "@/components/user-option-ui/UOButton";

const Answer = ({ item, onUserOption }: { item: ConversationItem, onUserOption?: any }) => {
  return (
    <div className='conversation-content-container'>
      <div className="chat-icon-container">
        <img className="chat-icon" src={img_user} />
      </div>
      <div className="qa-content answer-content">
        <div className="qa-text answer-text">
          <Markdown content={item.content}></Markdown>
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
