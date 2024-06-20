import React, { useContext, useEffect, useState } from "react"

import Header from "./Header"
import { getCurrentConversation, restartConversation, setCurrentConversationId } from "./utils";
import { getConversationContent, getConversations } from "@/api/network";
import { ConversationData, ConversationItem } from "@/types/app";
import Input from "./Input";
import { IOnCompleted, IOnData, IOnDataMoreInfo, sendMessage } from "@/api/sse";
import Answer from "./Answer";
import Question from "./Question";
import RespondIndicator from "./RespondIndicator";
import AppContext from "@/AppContext";
import StopRespondingButton from "./StopRespondingButton";

const Chat = () => {

  const { appInfo } = useContext(AppContext);
  const [currentConversation, setCurrentConversation] = useState<ConversationData | undefined>()
  const [contentList, setContentList] = React.useState<ConversationItem[]>([])

  // while agent is thinking, we will show loading animation as well as a cancel button
  const [responding, setResponding] = useState(false);
  const [abortController, setAbortController] = useState<AbortController>();

  // for example, when user double click question we will paste it to input box
  const [queryItem, setQueryItem] = useState<ConversationItem>();

  useEffect(() => {
    if (appInfo) {
      (async () => {
        try {
          let conversations: ConversationData[] = await getConversations(appInfo.code);
          let curConversation = getCurrentConversation(conversations);
          if (curConversation) {
            setCurrentConversation?.(curConversation);
            let conversationContent = await getConversationContent(curConversation.id, appInfo.code);

            // backend returns an array of messages, each message contains both query and answer.
            // we need to separate them and display them in a list.
            let list: ConversationItem[] = [];
            conversationContent.forEach(item => {
              list.push({ id: item.id, type: 'Q', content: item.query });
              list.push({ id: item.id, type: 'A', content: item.answer });
            });

            setContentList(list);
          }
        } catch (err) {
          console.error('Error initializing conversation', err);
        }
      })()
    }
  }, [appInfo])

  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, [contentList])

  const onRestart = () => {
    restartConversation();
    setContentList([]);
    setCurrentConversation(undefined);
  }

  const onSend = async (query: string) => {
    if (appInfo?.code) {
      // show loading immediately
      setResponding(true);

      // temperary local id for query item. backend is not aware of it
      let random = Math.random().toString(36).substring(7);
      setContentList(preContentList => [...preContentList, { id: random, type: 'Q', content: query }]);

      // when user starts the very first conversation, the currentConversation is null
      // by passing '' to backend, it will create a new conversation for us
      const conversationId = currentConversation?.id || '';
      sendMessage(appInfo?.code, conversationId, query, { onData, onCompleted, getAbortController });
    }
  }

  const onData: IOnData = (message: string, isFirstMessage: boolean, moreInfo: IOnDataMoreInfo) => {
    console.log('onData', message, isFirstMessage, moreInfo)
    setCurrentConversationId(moreInfo.conversationId)
    setContentList(preContentList => {
      let existingMessage = preContentList.find(item => item.id === moreInfo.messageId);
      if (existingMessage) {
        existingMessage.content += message;
        return [...preContentList];
      } else {
        return [...preContentList, { id: moreInfo.messageId, type: 'A', content: message }]
      }
    });
  }

  const onCompleted: IOnCompleted = (hasError?: boolean, errorMessage?: string) => {
    setResponding(false);
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

  return (
    <div className="chat-root">
      <Header title={appInfo?.title} onRestart={onRestart}></Header>
      <div className='conversation-container'>
        {
          contentList.map((item, index) => {
            if (item.type === 'Q') {
              return <Question key={index} item={item} onDoubleClick={() => onQuestionDoubleClick(item)} />
            } else if (item.type === 'A') {
              return <Answer key={index} content={item.content} />
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
