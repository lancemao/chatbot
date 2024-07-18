import AppContext from "@/AppContext";
import { useContext, useEffect, useState } from "react";
import './setting.css'
import { getMyInfo, submitMyInfo } from "@/api/network";

const SettingPage = () => {

  const { appInfo } = useContext(AppContext)
  const [content, setContent] = useState('')
  const [hasError, setHasError] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (appInfo) {
      getMyInfo(appInfo?.code).then((data: any) => setContent(data.content))
    }
  }, [])

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value
    if (v) {

    }
    setContent(e.target.value)
  }

  const onSubmit = () => {
    let text = content.trim()
    if (!text) {
      return
    }

    if (appInfo) {
      // first clear error message
      setHasError(false)
      setMessage('')

      // then try submit
      submitMyInfo(content, appInfo.code).then((data: any) => {
        if (data.errorCode === 0) {
          setMessage('提交成功')
        } else {
          setHasError(true)
          setMessage(data.message)
        }
      }).catch(e => {
        setHasError(true)
        setMessage(JSON.stringify(e))
      })
    }
  }

  return (
    <div className="setting-container">
      <div className="setting-content">
        <textarea className="setting-info-input"
          placeholder="请输入附加信息（小于一万字）"
          value={content}
          onChange={onChange} />
      </div>
      <div className={`setting-message ${hasError ? 'setting-message-error' : ''}`}>{message}</div>
      <div className={`setting-submit-button ${content ? 'setting-submit-button-active' : ''}`} onClick={onSubmit}>提交</div>
    </div>
  );
}

export default SettingPage;