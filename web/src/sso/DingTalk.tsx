import { useContext, useEffect, useState } from 'react';
import Chat from '../chat/Chat';
import AppContext from '@/AppContext';
import CryptoJS from 'crypto-js';
import * as dd from 'dingtalk-jsapi';
import VoiceContext from '@/VoiceContext';

const DingTalk = () => {
  const tip = 'Please open in DingTalk'

  const queryParams = new URLSearchParams(document.location.search);
  const corpId = queryParams.get('corpId');

  const { user, setUser, appInfo } = useContext(AppContext)
  const [isInDingTalk, setIsInDingTalk] = useState<boolean>(false)

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
          user.id = data.result.userid
          user.username = data.result.name
          user.avatar = data.result.detail?.avatar
          user.onIconClick = onIconClick
          setUser({ ...user }) // must create a new object to change React State
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
      alert('dd error: ' + JSON.stringify(err));
    })

    let ticket = await getJsTicket()

    let nonce = '1234567890'
    let timeStamp = Date.now()
    let url = window.location.href
    let signature = getJsApiSingnature(ticket, nonce, timeStamp, url)
    dd.config({
      agentId: import.meta.env.VITE_DINGTALK_AGENT_ID,
      corpId,
      timeStamp: timeStamp,
      nonceStr: nonce,
      signature: signature,
      jsApiList: [
        'device.audio.startRecord',
        'device.audio.stopRecord',
        'device.audio.download',
        'device.audio.playVoice',
        'device.audio.translateVoice'
      ]
    })
  }

  async function getJsTicket() {
    try {
      let res: any = await fetch('/agent/dingtalk/get-js-ticket')
      let data = await res.json()
      return data.ticket
    } catch (e) {
      console.error(e)
      return e
    }
  }

  function getJsApiSingnature(ticket, nonce, timeStamp, url) {
    let plainTex = "jsapi_ticket=" + ticket + "&noncestr=" + nonce + "&timestamp=" + timeStamp + "&url=" + url;
    let signature = CryptoJS.SHA256(plainTex).toString();
    return signature;
  }

  function onStart() {
    dd.device.audio.startRecord({
      success: () => { },
      fail: (e) => {
        alert('startRecord err ' + JSON.stringify(e))
      },
      complete: () => { },
    })
  }

  function onStop(cancel: boolean): Promise<string> {
    return new Promise((resolve, reject) => {
      dd.device.audio.stopRecord({
        success: (res) => {
          let { mediaId, duration } = res
          // alert('stopRecord success ' + JSON.stringify(res))
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
                    let text = res.content
                    resolve(text)
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

  return (
    <VoiceContext.Provider value={{ voicePreferred: true, onStart, onStop }}>
      <Chat />
    </VoiceContext.Provider>
  );
}

export default DingTalk;