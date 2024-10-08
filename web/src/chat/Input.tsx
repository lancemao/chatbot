import React, { useContext, useEffect, useRef } from "react"
import Textarea from 'rc-textarea'
import './input.css'
import sendActiveImage from "@/assets/images/send-active.svg";
import voiceInputImage from "@/assets/images/ic_voice_input.png";
import keyboardInputImage from "@/assets/images/ic_keyboard.png";
import VoiceContext, { VoiceState } from "@/VoiceContext";
import VoiceInputAnimator from "@/components/VoiceInputAnimator";
import AppContext from "@/AppContext";

const Input = ({ queryItem, onSend }) => {

  const inputContainerRef = useRef<HTMLDivElement>(null)

  const { isPC } = useContext(AppContext)
  const { voiceState, onStart, onStop } = useContext(VoiceContext)

  const [usingVoice, setUsingVoice] = React.useState(false)
  const [isRecording, setIsRecording] = React.useState(false)
  const [query, setQuery] = React.useState(queryItem?.content)
  const [insideVoiceInputContainer, setInsideVoiceInputContainer] = React.useState(false)

  const sendStyle = {
    backgroundImage: `url(${sendActiveImage})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  }

  useEffect(() => {
    const handleTouchMove = (event) => {
      if (event.touches[0] && inputContainerRef?.current) {
        const touchY = event.touches[0].clientY
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
    setUsingVoice(voiceState !== VoiceState.NA)
  }, [voiceState])

  useEffect(() => {
    // happens when query is from outside. e.g. double click on question
    setQuery(queryItem?.content)

    // change input type to text
    if (queryItem?.content) {
      setUsingVoice(false)
    }
  }, [queryItem])

  const onChange = (e) => {
    setQuery(e.target.value)
  }

  const onTextInputFocus = () => {
    // on some mobile phone the scrolHeight is not updated during keyboard animation
    setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight)
    }, 300)
  }

  const onInputSwitcherClick = () => {
    if (usingVoice) {
      setUsingVoice(false)
    } else {
      setUsingVoice(true)
    }
  }

  const onVoiceButtonDown = (e) => {
    if (voiceState !== VoiceState.READY) return

    onStart()
    setInsideVoiceInputContainer(true)
    setIsRecording(true)
    e.preventDefault();
  }

  const onVoiceButtonUp = (e) => {
    if (voiceState !== VoiceState.READY) return

    if (insideVoiceInputContainer) {
      (async () => {
        const text = await onStop(false)
        send(text)
      })()
    } else {
      onStop(true)
    }

    setIsRecording(false)
    e.preventDefault();
  }

  const onVoiceCancel = () => {
    setIsRecording(false)
  }

  const onPressEnter = () => {
    if (isPC) {
      send(query)
    }
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
        {
          voiceState !== VoiceState.NA &&
          <div className="chat-input-switch-button" onClick={onInputSwitcherClick}>
            <img className="chat-input-switch-button-image" src={usingVoice ? keyboardInputImage : voiceInputImage} />
          </div>
        }
        {
          usingVoice ?
            <div className={`chat-input-hold-to-speak-container ${voiceState === VoiceState.READY && 'chat-input-hold-to-speak-container-ready'}`}
              onMouseDown={onVoiceButtonDown}
              onMouseUp={onVoiceButtonUp}
              onTouchStart={onVoiceButtonDown}
              onTouchEnd={onVoiceButtonUp}
              onTouchCancel={onVoiceCancel}>
              {
                isRecording ? <VoiceInputAnimator cancel={!insideVoiceInputContainer} /> : <div style={{ pointerEvents: 'none' }}>按住 说话</div>
              }
            </div> :
            <Textarea
              autoFocus
              value={query}
              className="chat-input"
              autoSize
              onPressEnter={onPressEnter}
              onFocus={onTextInputFocus}
              onChange={onChange} />
        }
        <div className="chat-input-send-button-container">
          {!usingVoice && <div className="chat-send-button" style={sendStyle} onClick={() => send(query)}></div>}
        </div>
      </div>
    </div>
  )
}

export default React.memo(Input)
