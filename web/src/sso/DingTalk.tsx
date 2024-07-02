import { useContext, useEffect, useState } from 'react';
import Chat from '../chat/Chat';
import AppContext from '@/AppContext';
import * as dd from 'dingtalk-jsapi';
import VoiceContext, { VoiceState } from '@/VoiceContext';
import MarkdownContext from '@/MarkdownContext';
import User from './User';
import { Log } from '@/log/Log';

const DingTalk = () => {
  const ERR_NOT_IN_DINGTALK = 'Please open in DingTalk'
  const ERR_NO_CORP_ID = 'corpId not found. Add &corpId=$CORPID$ to the end of your app URL'

  const queryParams = new URLSearchParams(document.location.search);
  const corpId = queryParams.get('corpId');

  const { user, setUser, appInfo, addLog } = useContext(AppContext)
  const [voiceState, setVoiceState] = useState<VoiceState>(VoiceState.PREPARING)

  useEffect(() => {
    if (appInfo) {
      if (dd.env.platform !== 'notInDingTalk') {
        dd.setNavigationTitle({ title: appInfo?.title })
        user.onIconClick = onIconClick

        if (corpId) {
          dd.ready(function () {
            // request js api permission must be in ready and cannot use await
            grantJsPermission()

            dd.runtime.permission.requestAuthCode({
              corpId: corpId
            }).then((result) => {
              // addLog(Log.info(result.code))
              getUserInfo(result.code)
            }).catch((err) => {
              addLog(Log.error("获取授权码失败：" + JSON.stringify(err)))
            })
          })
        } else {
          addLog(Log.error(ERR_NO_CORP_ID))
          setVoiceState(VoiceState.NA)
        }
      } else {
        addLog(Log.error(ERR_NOT_IN_DINGTALK))
        setVoiceState(VoiceState.NA)
      }
    }
  }, [appInfo])

  function getUserInfo(code: string) {
    fetch('/agent/dingtalk/get-user-info?code=' + code)
      .then((res) => res.json())
      .then((data) => {
        // addLog(Log.info(JSON.stringify(data)))
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
        addLog(Log.error("获取用户信息失败：" + JSON.stringify(err)))
      })
  }

  function onIconClick() {
    if (dd.env.platform !== 'notInDingTalk') {
      window.location.href = 'https://applink.dingtalk.com/page/myProfile'
    } else {
      addLog(Log.error(ERR_NOT_IN_DINGTALK))
    }
  }

  async function grantJsPermission() {

    dd.error(function (err) {
      addLog(Log.error("获取js api权限失败：" + JSON.stringify(err)))
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
        'biz.util.openLink',
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
      addLog(Log.error(e))
      return e
    }
  }

  function onStart() {
    dd.device.audio.startRecord({
      success: () => { },
      fail: (err) => {
        addLog(Log.error("startRecord err " + JSON.stringify(err)))
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
                    addLog(Log.error("translateVoice err " + JSON.stringify(e)))
                    reject('translateVoice err ' + JSON.stringify(e))
                  }
                })
              },
              fail: (e) => {
                addLog(Log.error("downloadAudio err " + JSON.stringify(e)))
                reject('downloadAudio err ' + JSON.stringify(e))
              },
              complete: () => { },
            });
          }
        },
        fail: (e) => {
          addLog(Log.error("stopRecord err " + JSON.stringify(e)))
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
        const userId = searchParams.get('userId') || '';
        dd.openChatByUserId({
          userId,
          corpId,
          success: () => { },
          fail: err => {
            addLog(Log.error("openChatByUserId err " + JSON.stringify(err)))
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