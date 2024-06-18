import React, { useContext, useEffect, useRef, useState } from "react"
import Textarea from 'rc-textarea'
import sendActiveImage from "@/assets/images/send-active.svg";
import voiceInputImage from "@/assets/images/ic_voice_input.png";
import keyboardInputImage from "@/assets/images/ic_keyboard.png";
import VoiceContext from "@/VoiceContext";

const Input = ({ onSend }) => {

  const inputContainerRef = useRef(null)

  const { voicePreferred, onStart, onStop } = useContext(VoiceContext)

  const [usingVoice, setUsingVoice] = React.useState(false)
  const [isRecording, setIsRecording] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [insideVoiceInputContainer, setInsideVoiceInputContainer] = React.useState(false)

  const sendStyle = {
    backgroundImage: `url(${sendActiveImage})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  }

  useEffect(() => {
    const handleTouchMove = (event) => {
      if (event.touches[0]) {
        let touchY = event.touches[0].clientY
        if (touchY < inputContainerRef?.current?.getBoundingClientRect().top) {
          setInsideVoiceInputContainer(false)
        } else {
          setInsideVoiceInputContainer(true)
        }
      }
    };

    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  useEffect(() => {
    setUsingVoice(voicePreferred)
  }, [voicePreferred])

  const onChange = (e) => {
    setQuery(e.target.value)
  }

  const onPressEnter = (e) => {
    e.preventDefault()
    send(query)
  }

  const onInputSwitcherClick = () => {
    if (usingVoice) {
      setUsingVoice(false)
    } else {
      setUsingVoice(true)
    }
  }

  const onVoiceButtonDown = () => {
    onStart()
    setInsideVoiceInputContainer(true)
    setIsRecording(true)
  }

  const onVoiceButtonUp = () => {
    if (insideVoiceInputContainer) {
      (async () => {
        let text = await onStop(false)
        send(text)
      })()
    } else {
      onStop(true)
    }

    setIsRecording(false)
  }

  const onVoiceCancel = () => {
    setIsRecording(false)
  }

  const send = (query) => {
    if (query) {
      onSend?.(query)
      setQuery('')
    }
  }

  return (
    <div className='chat-input-area'>
      <div className='chat-input-container' ref={inputContainerRef}>
        <div className="chat-input-switch-button" onClick={onInputSwitcherClick}>
          <img className="chat-input-switch-button-image" src={usingVoice ? keyboardInputImage : voiceInputImage} />
        </div>
        {
          usingVoice ?
            <div className="chat-input-hold-to-speak-container"
              onTouchStart={onVoiceButtonDown}
              onTouchEnd={onVoiceButtonUp}
              onTouchCancel={onVoiceCancel}>
              <div>{isRecording ? (insideVoiceInputContainer ? '松开 发送' : '松开 取消') : '按住 说话'}</div>
            </div> :
            <Textarea
              value={query}
              className="chat-input"
              autoSize
              onChange={onChange}
              onPressEnter={onPressEnter} />
        }
        <div className="chat-input-send-button-container">
          {!usingVoice && <div className="chat-send-button" style={sendStyle} onClick={() => send(query)}></div>}
        </div>
      </div>
    </div>
  )
}

export default React.memo(Input)
