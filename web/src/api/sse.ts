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

export type OnCompleteData = {
  code?: string
  created_at?: number
  conversation_id?: string
  event?: string
  message: string
  message_id?: string
  status?: number
}

export type WorkflowStartedResponse = {
  task_id: string
  message_id: string
  workflow_run_id: string
  event: string
  data: {
    id: string
    workflow_id: string
    sequence_number: number
    created_at: number
  }
}

export type WorkflowFinishedResponse = {
  task_id: string
  workflow_run_id: string
  event: string
  data: {
    id: string
    workflow_id: string
    status: string
    outputs: any
    error: string
    elapsed_time: number
    total_tokens: number
    total_steps: number
    created_at: number
    created_by: {
      id: string
      name: string
      email: string
    }
    finished_at: number
  }
}

export type NodeStartedResponse = {
  task_id: string
  workflow_run_id: string
  event: string
  data: {
    id: string
    node_id: string
    node_type: string
    index: number
    predecessor_node_id?: string
    inputs: any
    created_at: number
    extras?: any
  }
}

export type NodeFinishedResponse = {
  task_id: string
  workflow_run_id: string
  event: string
  data: {
    id: string
    node_id: string
    node_type: string
    index: number
    predecessor_node_id?: string
    inputs: any
    process_data: any
    outputs: any
    status: string
    error: string
    elapsed_time: number
    execution_metadata: {
      total_tokens: number
      total_price: number
      currency: string
    }
    created_at: number
  }
}

export type NodeDataResponse = {
  id: string | undefined
  start: NodeStartedResponse | undefined
  finish: NodeFinishedResponse | undefined
}

export type WorkFlowResponse = {
  start: WorkflowStartedResponse | undefined
  finish: WorkflowFinishedResponse | undefined
  nodes: NodeDataResponse[] | undefined
}

export type IOnData = (message: string, isFirstMessage: boolean, moreInfo: IOnDataMoreInfo) => void
export type IOnWorkflowDone = (workFlowResponse: WorkFlowResponse) => void
export type IOnCompleted = (data?: OnCompleteData) => void

const handleStream = (
  response: Response,
  workFlowResponse: WorkFlowResponse,
  onData: IOnData,
  onWorkflowDone?: IOnWorkflowDone,
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
              onCompleted?.(bufferObj as OnCompleteData)
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
            } else if (bufferObj.event === 'workflow_started') {
              workFlowResponse.start = bufferObj as WorkflowStartedResponse
              workFlowResponse.nodes = []
            } else if (bufferObj.event === 'workflow_finished') {
              workFlowResponse.finish = bufferObj as WorkflowFinishedResponse
              onWorkflowDone?.(workFlowResponse)
            } else if (bufferObj.event === 'node_started') {
              const nodeStart = bufferObj as NodeStartedResponse
              const nodeData: NodeDataResponse = { id: nodeStart.data.node_id, start: nodeStart, finish: undefined }
              workFlowResponse.nodes?.push(nodeData)
            } else if (bufferObj.event === 'node_finished') {
              const nodeFinish = bufferObj as NodeFinishedResponse
              const nodeData = workFlowResponse.nodes?.find(node => node.id === nodeFinish.data.node_id)
              if (nodeData) {
                nodeData.finish = nodeFinish
              }
            }
          }
        })
        buffer = lines[lines.length - 1]
      }
      catch (e) {
        console.error('sse: should not come here', e)
        hasError = true
        onCompleted?.({ message: `${e}` })
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
    onWorkflowDone,
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

  // stores workflow info
  const workFlowResponse: WorkFlowResponse = {
    start: undefined,
    finish: undefined,
    nodes: undefined
  }

  fetch(url, options as RequestInit)
    .then((res) => {
      if (!/^(2|3)\d{2}$/.test(String(res.status))) {
        res.json().then((data: any) => {
          alert(`sse error:${data.message}`)
        })
        onError?.('Server Error')
        return
      }
      handleStream(res, workFlowResponse, (str: string, isFirstMessage: boolean, moreInfo: IOnDataMoreInfo) => {
        if (moreInfo.errorMessage) {
          onError?.(moreInfo.errorMessage, moreInfo.errorCode)
          if (moreInfo.errorMessage !== 'AbortError: The user aborted a request.')
            // Toast.notify({ type: 'error', message: moreInfo.errorMessage })
            return
        }
        onData?.(str, isFirstMessage, moreInfo)
      }, onWorkflowDone, onCompleted)
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