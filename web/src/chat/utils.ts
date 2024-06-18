import { fetchAccessToken } from "@/api/network"
import type { AppInfo, ConversationData } from "@/types/app"

const CONVERSATION_ID_INFO = 'conversationIdInfo'

export const checkOrSetAccessToken = async (appCode: string) => {
  const sharedToken = appCode
  const accessToken = localStorage.getItem('token') || JSON.stringify({ [appCode]: '' })
  let accessTokenJson = { [sharedToken]: '' }
  try {
    accessTokenJson = JSON.parse(accessToken)
  }
  catch (e) {

  }
  if (!accessTokenJson[sharedToken]) {
    const res = await fetchAccessToken(sharedToken)
    if (res) {
      accessTokenJson[sharedToken] = res.access_token
      localStorage.setItem('token', JSON.stringify(accessTokenJson))
    }
  }
}

export function getAccessToken(appCode: string): string {
  const sharedToken = appCode
  const accessToken = localStorage.getItem('token') || JSON.stringify({ [sharedToken]: '' })
  let accessTokenJson = { [sharedToken]: '' }
  try {
    accessTokenJson = JSON.parse(accessToken)
  } catch (e) {

  }
  return accessTokenJson[sharedToken]
}

export const setAccessToken = async (sharedToken: string, token: string) => {
  const accessToken = localStorage.getItem('token') || JSON.stringify({ [sharedToken]: '' })
  let accessTokenJson = { [sharedToken]: '' }
  try {
    accessTokenJson = JSON.parse(accessToken)
  }
  catch (e) {

  }

  localStorage.removeItem(CONVERSATION_ID_INFO)

  accessTokenJson[sharedToken] = token
  localStorage.setItem('token', JSON.stringify(accessTokenJson))
}

export const removeAccessToken = () => {
  const sharedToken = globalThis.location.pathname.split('/').slice(-1)[0]

  const accessToken = localStorage.getItem('token') || JSON.stringify({ [sharedToken]: '' })
  let accessTokenJson = { [sharedToken]: '' }
  try {
    accessTokenJson = JSON.parse(accessToken)
  }
  catch (e) {

  }

  localStorage.removeItem(CONVERSATION_ID_INFO)

  delete accessTokenJson[sharedToken]
  localStorage.setItem('token', JSON.stringify(accessTokenJson))
}

export function flatAppInfo(appCode: string, appInfo: any): AppInfo {
  let res: AppInfo = {
    code: appCode,
    app_id: appInfo.app_id,
    title: appInfo.site.title,
    icon: appInfo.site.icon,
    description: appInfo.site.description,
    default_language: appInfo.site.default_language,
    custom_disclaimer: appInfo.site.custom_disclaimer,
  }
  return res;
}

export function getCurrentConversation(conversations: ConversationData[]): ConversationData | undefined {
  const curConversation = localStorage.getItem('current_conversation') || 'none';
  if (curConversation === 'none') {
    return undefined;
  } else {
    return conversations.find((conversation) => conversation.id === curConversation);
  }
}

export function setCurrentConversationId(conversationId: string | undefined) {
  conversationId && localStorage.setItem('current_conversation', conversationId);
}

export function restartConversation() {
  localStorage.removeItem('current_conversation');
}
