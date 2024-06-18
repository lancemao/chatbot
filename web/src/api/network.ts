
import { flatAppInfo, getAccessToken } from '@/chat/utils';
import type { AppInfo, ConversationContent, ConversationData } from '../types/app';

export async function fetchAccessToken(appCode: string): Promise<{ access_token: string } | null> {
  let options = {
    method: 'GET',
    headers: {
      'X-App-Code': appCode
    }
  }
  try {
    let response = await fetch(`/api/passport`, options);
    if (response.status === 200) {
      return await response.json();
    } else {
      return null;
    }
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function getAppInfo(appCode: string): Promise<AppInfo> {
  let data = await request<any>(`/api/site`, 'GET', appCode);
  return flatAppInfo(appCode, data);
}

export async function getConversations(appCode: string): Promise<[ConversationData]> {
  let data = await request<any>(`/api/conversations`, 'GET', appCode);
  return data.data;
}

export async function getConversationContent(conversationId: string, appCode: string): Promise<[ConversationContent]> {
  let data = await request<any>(`/api/messages?conversation_id=${conversationId}`, 'GET', appCode);
  return data.data;
}

async function request<T>(
  url: string,
  method: string,
  appCode: string
): Promise<T>  {
  const accessToken = getAccessToken(appCode)
  let options = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    }
  }

  try {
    let response = await fetch(url, options);
    if (response.status === 200) {
      let result = await response.json();
      return result
    } else {
      return await response.json();
    }
  } catch (e) {
    console.error(e);
    return e;
  }
}