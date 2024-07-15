import React, { useContext, useEffect, useRef, useState } from "react"

import "./chat.css"

import Header from "./Header"
import { generateOpeningStatementMeta, getCurrentConversation, restartConversation, setCurrentConversationId } from "./utils";
import { getConversationContent, getConversations } from "@/api/network";
import { ConversationData, ConversationItem } from "@/types/app";
import Input from "./Input";
import { IOnCompleted, IOnData, IOnDataMoreInfo, IOnWorkflowDone, OnCompleteData, WorkFlowResponse, sendMessage } from "@/api/sse";
import Answer from "./Answer";
import Question from "./Question";
import RespondIndicator from "./RespondIndicator";
import AppContext from "@/AppContext";
import StopRespondingButton from "./StopRespondingButton";
import RuntimeContext from "@/RuntimeContext";

const Chat = () => {

  const { appInfo, addLog } = useContext(AppContext);
  const { location } = useContext(RuntimeContext)
  const [currentConversation, setCurrentConversation] = useState<ConversationData | undefined>()
  const [contentList, setContentList] = React.useState<ConversationItem[]>([])
  const conversationContainerRef = useRef<HTMLDivElement>(null);

  // while agent is thinking, we will show loading animation as well as a cancel button
  const [responding, setResponding] = useState(false);
  const [abortController, setAbortController] = useState<AbortController>();

  // for example, when user double click question we will paste it to input box
  const [queryItem, setQueryItem] = useState<ConversationItem>();

  useEffect(() => {
    if (appInfo) {
      (async () => {
        try {
          const list: ConversationItem[] = initConversationList();

          const conversations: ConversationData[] = await getConversations(appInfo.code);
          const curConversation = getCurrentConversation(conversations);
          if (curConversation) {
            setCurrentConversation?.(curConversation);
            const conversationContent = await getConversationContent(curConversation.id, appInfo.code);

            // backend returns an array of messages, each message contains both query and answer.
            // we need to separate them and display them in a list.
            conversationContent.forEach(item => {
              list.push({ id: item.id, type: 'Q', content: item.query.trim() , displayEnd: item.query.length, completed: true });
              list.push({ id: item.id, type: 'A', content: item.answer.trim(), displayEnd: item.answer.length, completed: true });
            });
          }

          setContentList(list);

        } catch (err) {
          console.error('Error initializing conversation', err);
        }
      })()
    }
  }, [appInfo])

  useEffect(() => {
    setTimeout(() => {
      conversationContainerRef?.current?.scrollTo(0, conversationContainerRef?.current?.scrollHeight);
    }, 10)
  }, [responding, contentList])

  const onRestart = () => {
    restartConversation();
    setContentList(initConversationList());
    setCurrentConversation(undefined);
  }

  function initConversationList(): ConversationItem[] {
    const list: ConversationItem[] = [];
    if (appInfo?.opening_statement) {
      // if there is an opening statement, we will add it to the list as the first item.
      const userOptionMeta = generateOpeningStatementMeta(appInfo.suggested_questions)
      list.push({ id: '0', type: 'A', content: appInfo.opening_statement, meta: userOptionMeta, displayEnd: appInfo.opening_statement.length, completed: true });
    }
    return list
  }

  const onSend = async (query: string) => {
    if (appInfo?.code) {
      // show loading immediately
      setResponding(true);

      // temperary local id for query item. backend is not aware of it
      const random = Math.random().toString(36).substring(7);
      setContentList(preContentList => [...preContentList, { id: random, type: 'Q', content: query, displayEnd: query.length, completed: true }]);

      // when user starts the very first conversation, the currentConversation is null
      // by passing '' to backend, it will create a new conversation for us
      const conversationId = currentConversation?.id || '';
      const inputs = { location }
      sendMessage(appInfo?.code, conversationId, inputs, query, { onData, onWorkflowDone, onCompleted, getAbortController });
    }
  }

  const onData: IOnData = (message: string, isFirstMessage: boolean, moreInfo: IOnDataMoreInfo) => {
    // console.log('onData', message, isFirstMessage, moreInfo)
    setCurrentConversationId(moreInfo.conversationId)
    setContentList(preContentList => {
      const existingMessage = preContentList.find(item => item.id === moreInfo.messageId);
      if (existingMessage) {
        existingMessage.content += message;
        return [...preContentList];
      } else {
        return [...preContentList, { id: moreInfo.messageId, type: 'A', content: message, displayEnd: 0, completed: false }]
      }
    });
  }

  const onWorkflowDone: IOnWorkflowDone = (workflow: WorkFlowResponse) => {
    console.log('onWorkflowDone', workflow)
    const msgId = workflow.start?.message_id
    if (msgId) {
      setContentList(preContentList => {
        const existingMessage = preContentList.find(item => item.id === msgId);
        if (existingMessage) {
          existingMessage.workflow = workflow;
          existingMessage.completed = true
          return [...preContentList];
        } else {
          return [...preContentList, { id: msgId, type: 'A', content: '', workflow: workflow, displayEnd: 0, completed: false }]
        }
      })
    }
  }

  const onCompleted: IOnCompleted = (data?: OnCompleteData) => {
    console.log('onCompleted', data)
    setResponding(false);
    if (data?.message_id) {
      const msgId = data.message_id;
      setContentList(preContentList => {
        const existingMessage = preContentList.find(item => item.id === msgId);
        if (existingMessage) {
          existingMessage.content = data.message;
          existingMessage.completed = true
          return [...preContentList];
        } else {
          return [...preContentList, { id: msgId, type: 'A', content: data.message, displayEnd: data.message.length, completed: true }]
        }
      })
    }
  }

  const getAbortController = (controller: AbortController) => {
    setAbortController(controller);
  }

  const onStopRespondingClick = () => {
    setResponding(false);
    abortController?.abort('user canceled query')
  }

  const onQuestionDoubleClick = (item: ConversationItem) => {
    setQueryItem({ ...item })
  }

  const onUserOption = (option: string) => {
    onSend(option)
  }

  return (
    <div className="chat-root">
      <Header title={appInfo?.title} onRestart={onRestart}></Header>
      <div className='conversation-container' ref={conversationContainerRef}>
        {
          contentList.map((item, index) => {
            if (item.type === 'Q') {
              return <Question key={index} item={item} onDoubleClick={() => onQuestionDoubleClick(item)} />
            } else if (item.type === 'A') {
              return <Answer key={index} item={item} onUserOption={onUserOption} />
            }
          })
        }
        <RespondIndicator responding={responding} />
      </div>
      <StopRespondingButton responding={responding} onClick={onStopRespondingClick} />
      <Input queryItem={queryItem} onSend={onSend} />
    </div>
  )
}

export default React.memo(Chat)
