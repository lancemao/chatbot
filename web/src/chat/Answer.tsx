import React from "react"
import img_user from '@/assets/images/user_profile.svg';
import Markdown from "@/components/Markdown";
import { UOButtonMeta, UOInputMeta, UOMessageMeta, UOMeta, UOTDatePickerMeta, UOTextAreaMeta, UOTextMeta, UOType } from "@/components/user-option-ui/type";
import { ConversationItem } from "@/types/app";
import UOButton from "@/components/user-option-ui/UOButton";
import { useNavigate } from "react-router-dom";
import UOText from "@/components/user-option-ui/UOText";
import UOInput from "@/components/user-option-ui/UOInput";
import { UOParser } from "@/components/user-option-ui/UOParser";
import UOTextArea from "@/components/user-option-ui/UOTextArea";
import UODatePicker from "@/components/user-option-ui/UODatePicker";

const Answer = ({ item, onUserOption }: { item: ConversationItem, onUserOption?: any }) => {

  const navigate = useNavigate();

  const [userOption, setUserOption] = React.useState(UOParser.parse(item.content))

  const onButtonClick = (option: string, action: string) => {
    if (action === 'submit') {
      let allRequiredFieldsBeenFilled = true
      let query = ''
      if (userOption?.content) {
        const content = userOption.content.map((meta: UOMeta) => {
          if (!meta.text && meta.required) {
            meta.error = 'This field is required'
            allRequiredFieldsBeenFilled = false
          }
          query += meta.text || ''
          return meta
        })
        setUserOption({ ...userOption, content })
      }
      if (allRequiredFieldsBeenFilled) {
        onUserOption?.(query)
      }
    } else {
      onUserOption?.(option)
    }
  }

  const onTextAreaChange = (meta: UOTextAreaMeta) => {
    if (userOption?.content) {
      const content = userOption.content.map((m: UOMeta) => {
        if (m.id === meta.id) {
          m.error = ''
          return meta
        }
        return m
      })
      setUserOption({ ...userOption, content })
    }
  }

  const createUOComponent = (meta: UOMeta, index: number) => {
    return <React.Fragment key={index}>
      {
        meta.type === UOType.Text &&
        <UOText meta={meta as UOTextMeta} />
      }
      {
        meta.type === UOType.Button &&
        <UOButton meta={meta as UOButtonMeta} onClick={(option, action) => {
          onButtonClick(option, action)
        }} />
      }
      {
        meta.type === UOType.Input &&
        <UOInput meta={meta as UOInputMeta} />
      }
      {
        meta.type === UOType.TextArea &&
        <UOTextArea meta={meta as UOTextAreaMeta} onTextAreaChange={onTextAreaChange} />
      }
      {
        meta.type === UOType.DatePicker &&
        <UODatePicker meta={meta as UOTDatePickerMeta} />
      }
    </React.Fragment>
  }

  const createUOContent = (meta: UOMessageMeta) => {
    return (
      <>
        {
          meta?.header?.title && <div className="uo-header-title">{meta?.header?.title}</div>
        }
        {
          meta?.header?.description && <div className="uo-header-description">{meta?.header?.description}</div>
        }
        {
          meta?.content && <div className="uo-content">
            {
              meta?.content?.map((meta: UOMeta, index) => {
                return createUOComponent(meta, index)
              })
            }
          </div>
        }
        {
          meta?.options?.map((meta: UOMeta, index) => {
            return createUOComponent(meta, index)
          })
        }
      </>
    )
  }

  return (
    <div className='conversation-content-container'>
      <div className="chat-icon-container">
        <img className="chat-icon" src={img_user} />
      </div>
      <div className="qa-content answer-content" onDoubleClick={() => {
        item.workflow && navigate('/chatx/answer-detail', { state: item });
      }}>
        <div className="qa-text answer-text">
          {
            item.id === 'error' ?
              <div className="answer-text-error">{item.content}</div>
              : userOption ? createUOContent(userOption)
                : <Markdown content={item.content}></Markdown>
          }
          {
            item.meta && createUOContent(item.meta)
          }
        </div>
      </div>
      <div className="chat-icon-container"></div>
    </div>
  )
}

export default React.memo(Answer)
