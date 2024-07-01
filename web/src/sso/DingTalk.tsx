import { useContext, useEffect, useState } from 'react';
import Chat from '../chat/Chat';
import AppContext from '@/AppContext';
import * as dd from 'dingtalk-jsapi';
import VoiceContext, { VoiceState } from '@/VoiceContext';
import MarkdownContext from '@/MarkdownContext';
import User from './User';

const DingTalk = () => {
  const tip = 'Please open in DingTalk'

  const queryParams = new URLSearchParams(document.location.search);
  const corpId = queryParams.get('corpId');

  const { user, setUser, appInfo } = useContext(AppContext)
  const [isInDingTalk, setIsInDingTalk] = useState<boolean>(false)
  const [voiceState, setVoiceState] = useState<VoiceState>(VoiceState.PREPARING)

  useEffect(() => {
    setIsInDingTalk(dd.env.platform !== 'notInDingTalk')
    user.onIconClick = onIconClick
  }, [])

  useEffect(() => {
    if (appInfo && isInDingTalk) {
      dd.setNavigationTitle({ title: appInfo?.title })
    }
  }, [appInfo])

  useEffect(() => {
    if (isInDingTalk && corpId) {
      dd.ready(function () {
        // request js api permission must be in ready and cannot use await
        grantJsPermission()

        dd.runtime.permission.requestAuthCode({
          corpId: corpId
        }).then((result) => {
          // alert(result.code)
          getUserInfo(result.code)
        }).catch((err) => {
          alert("获取授权码失败：" + JSON.stringify(err));
        })
      })
    } else {
      console.error(tip)
      setVoiceState(VoiceState.NA)
    }
  }, [isInDingTalk])

  function getUserInfo(code: string) {
    fetch('/agent/dingtalk/get-user-info?code=' + code)
      .then((res) => res.json())
      .then((data) => {
        console.log(JSON.stringify(data))
        // alert(JSON.stringify(data));
        // window.localStorage.setItem('_practical_ai_user', data.result.userid)
        if (data.errcode === 0) {
          const u = new User(data.result.userid)
          u.username = data.result.name
          u.email = data.result.detail?.email
          u.avatar = data.result.detail?.avatar
          u.nickname = data.result.detail?.nickname
          u.mobile = data.result.detail?.mobile
          u.position = data.result.detail?.title
          u.hiredDate = data.result.detail?.hired_date
          u.employeeId = data.result.detail?.job_number
          u.raw = JSON.stringify(data.result.detail)
          u.onIconClick = onIconClick
          setUser(u)
        }
      }).catch((err) => {
        alert("获取用户信息失败：" + JSON.stringify(err));
      })
  }

  function onIconClick() {
    if (isInDingTalk) {
      window.location.href = 'https://applink.dingtalk.com/page/myProfile'
    } else {
      console.error(tip)
    }
  }

  async function grantJsPermission() {

    dd.error(function (err) {
      console.error(err)
      alert(JSON.stringify(err))
      setVoiceState(VoiceState.NA)
    })

    // url needs to be encoded
    const info = await getJsAPIInfo(encodeURIComponent(window.location.href))
    const { agentId, timeStamp, nonceStr, signature } = info
    dd.config({
      agentId,
      corpId,
      timeStamp,
      nonceStr,
      signature,
      jsApiList: [
        'biz.chat.openSingleChat',
        'device.audio.startRecord',
        'device.audio.stopRecord',
        'device.audio.download',
        'device.audio.translateVoice'
      ]
    })

    setVoiceState(VoiceState.READY)
  }

  async function getJsAPIInfo(url: string) {
    try {
      const res = await fetch('/agent/dingtalk/get-js-api-signature?url=' + url)
      return await res.json()
    } catch (e) {
      console.error(e)
      return e
    }
  }

  function onStart() {
    dd.device.audio.startRecord({
      success: () => { },
      fail: () => {
        // we don't show error here. Most likely error is permission denied 
        // which is already shown when requesting JS API permission
      },
      complete: () => { },
    })
  }

  function onStop(cancel: boolean): Promise<string> {
    return new Promise((resolve, reject) => {
      dd.device.audio.stopRecord({
        success: (res) => {
          const { mediaId, duration } = res
          if (cancel) {
            resolve('')
          } else {
            dd.device.audio.download({
              mediaId,
              success: () => {
                dd.device.audio.translateVoice({
                  mediaId,
                  duration,
                  success: (res) => {
                    resolve(res.content)
                  },
                  fail: (e) => {
                    reject('translateVoice err ' + JSON.stringify(e))
                  }
                })
              },
              fail: (e) => {
                reject('downloadAudio err ' + JSON.stringify(e))
              },
              complete: () => { },
            });
          }
        },
        fail: (e) => {
          reject('stopRecord err ' + JSON.stringify(e))
        },
        complete: () => { },
      })
    })
  }

  const onLinkClick = (e, url: string) => {
    if (url?.startsWith('http://dingtalk.ai') && corpId) {
      e.preventDefault()
      const urlObj = new URL(url)
      const path = urlObj.pathname
      if (path === '/chat') {
        const searchParams = new URLSearchParams(urlObj.search)
        // const searchParams = new URLSearchParams(url.substring(url.indexOf('?') + 1));
        const userId = searchParams.get('userId') || '';
        dd.openChatByUserId({
          userId,
          corpId,
          success: () => { },
          fail: err => {
            alert(JSON.stringify(err))
          }
        })
      }
    }
  }

  return (
    <VoiceContext.Provider value={{ voiceState, onStart, onStop }}>
      <MarkdownContext.Provider value={{ onLinkClick }} >
        <Chat />
      </MarkdownContext.Provider>
    </VoiceContext.Provider >
  );
}

export default DingTalk;