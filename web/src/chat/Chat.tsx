import React, { useContext, useEffect, useState } from "react"

import "./chat.css"

import Header from "./Header"
import { generateOpeningStatementMeta, getCurrentConversation, restartConversation, setCurrentConversationId } from "./utils";
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
          const list: ConversationItem[] = initConversationList();

          const conversations: ConversationData[] = await getConversations(appInfo.code);
          const curConversation = getCurrentConversation(conversations);
          if (curConversation) {
            setCurrentConversation?.(curConversation);
            const conversationContent = await getConversationContent(curConversation.id, appInfo.code);

            // backend returns an array of messages, each message contains both query and answer.
            // we need to separate them and display them in a list.
            conversationContent.forEach(item => {
              list.push({ id: item.id, type: 'Q', content: item.query });
              list.push({ id: item.id, type: 'A', content: item.answer });
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
    window.scrollTo(0, document.body.scrollHeight);
  }, [contentList])

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
      list.push({ id: '0', type: 'A', content: appInfo.opening_statement, meta: userOptionMeta });
    }
    return list
  }

  const onSend = async (query: string) => {
    if (appInfo?.code) {
      // show loading immediately
      setResponding(true);

      // temperary local id for query item. backend is not aware of it
      const random = Math.random().toString(36).substring(7);
      setContentList(preContentList => [...preContentList, { id: random, type: 'Q', content: query }]);

      // when user starts the very first conversation, the currentConversation is null
      // by passing '' to backend, it will create a new conversation for us
      const conversationId = currentConversation?.id || '';
      sendMessage(appInfo?.code, conversationId, query, { onData, onCompleted, getAbortController });
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
        return [...preContentList, { id: moreInfo.messageId, type: 'A', content: message }]
      }
    });
  }

  const onCompleted: IOnCompleted = (hasError?: boolean, errorMessage?: string) => {
    setResponding(false);
    if (hasError) {
      console.error(errorMessage)
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
      <div className='conversation-container'>
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
