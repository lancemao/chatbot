import { getAccessToken } from "@/chat/utils"

export const sendMessage = async (appCode: string, conversation_id: string | undefined, query: string, callbacks) => {
  const body = {
    inputs: {},
    query,
    response_mode: 'streaming',
    conversation_id
  }
  await ssePost(appCode, '/api/chat-messages', body, callbacks)
}

export type IOnDataMoreInfo = {
  conversationId?: string
  taskId?: string
  messageId: string
  errorMessage?: string
  errorCode?: string
}

export type IOnData = (message: string, isFirstMessage: boolean, moreInfo: IOnDataMoreInfo) => void
export type IOnCompleted = (hasError?: boolean, errorMessage?: string) => void

const handleStream = (
  response: Response,
  onData: IOnData,
  onCompleted?: IOnCompleted,
) => {
  if (!response.ok)
    throw new Error('Network response was not ok')

  const reader = response.body?.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let bufferObj: Record<string, any>
  let isFirstMessage = true
  function read() {
    let hasError = false
    reader?.read().then((result: any) => {
      if (result.done) {
        onCompleted?.()
        return
      }
      buffer += decoder.decode(result.value, { stream: true })
      const lines = buffer.split('\n')
      try {
        lines.forEach((message) => {
          if (message.startsWith('data: ')) { // check if it starts with data:
            try {
              bufferObj = JSON.parse(message.substring(6)) as Record<string, any>// remove data: and parse as json
            }
            catch (e) {
              // mute handle message cut off
              onData('', isFirstMessage, {
                conversationId: bufferObj?.conversation_id,
                messageId: bufferObj?.message_id,
              })
              return
            }
            if (bufferObj.status === 400 || !bufferObj.event) {
              onData('', false, {
                conversationId: undefined,
                messageId: '',
                errorMessage: bufferObj?.message,
                errorCode: bufferObj?.code,
              })
              hasError = true
              onCompleted?.(true, bufferObj?.message)
              return
            }
            if (bufferObj.event === 'message' || bufferObj.event === 'agent_message') {
              // can not use format here. Because message is splited.
              onData(unicodeToChar(bufferObj.answer), isFirstMessage, {
                conversationId: bufferObj.conversation_id,
                taskId: bufferObj.task_id,
                messageId: bufferObj.id,
              })
              isFirstMessage = false
            }
          }
        })
        buffer = lines[lines.length - 1]
      }
      catch (e) {
        onData('', false, {
          conversationId: undefined,
          messageId: '',
          errorMessage: `${e}`,
        })
        hasError = true
        onCompleted?.(true, e as string)
        return
      }
      if (!hasError)
        read()
    })
  }
  read()
}

const ssePost = (
  appCode: string,
  url: string,
  body: any,
  {
    onData,
    onCompleted,
    onError,
    getAbortController,
  },
) => {
  const abortController = new AbortController()

  const options = {
    method: 'POST',
    signal: abortController.signal,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAccessToken(appCode)}`,
    },
    body: JSON.stringify(body)
  }

  getAbortController?.(abortController)

  fetch(url, options as RequestInit)
    .then((res) => {
      if (!/^(2|3)\d{2}$/.test(String(res.status))) {
        res.json().then((data: any) => {
          alert(`sse error:${data.message}`)
        })
        onError?.('Server Error')
        return
      }
      return handleStream(res, (str: string, isFirstMessage: boolean, moreInfo: IOnDataMoreInfo) => {
        if (moreInfo.errorMessage) {
          onError?.(moreInfo.errorMessage, moreInfo.errorCode)
          if (moreInfo.errorMessage !== 'AbortError: The user aborted a request.')
            // Toast.notify({ type: 'error', message: moreInfo.errorMessage })
            return
        }
        onData?.(str, isFirstMessage, moreInfo)
      }, onCompleted)
    }).catch((e) => {
      if (e.toString() !== 'AbortError: The user aborted a request.')
        // Toast.notify({ type: 'error', message: e })
        onError?.(e)
    })
}

function unicodeToChar(text: string) {
  if (!text)
    return ''

  return text.replace(/\\u[0-9a-f]{4}/g, (_match, p1) => {
    return String.fromCharCode(parseInt(p1, 16))
  })
}