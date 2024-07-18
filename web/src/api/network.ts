
import { flatAppInfo, getAccessToken } from '@/chat/utils';
import type { AppInfo, ConversationContent, ConversationData } from '../types/app';

export async function fetchAccessToken(appCode: string): Promise<{ access_token: string } | null> {
  const options = {
    method: 'GET',
    headers: {
      'X-App-Code': appCode
    }
  }
  try {
    const response = await fetch(`/api/passport`, options);
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
  const site = await request<any>(`/api/site`, 'GET', appCode);
  const parameters = await request<any>(`/api/parameters`, 'GET', appCode);
  return flatAppInfo(appCode, site, parameters);
}

export async function getConversations(appCode: string): Promise<[ConversationData]> {
  const data = await request<any>(`/api/conversations`, 'GET', appCode);
  return data.data;
}

export async function getConversationContent(conversationId: string, appCode: string): Promise<[ConversationContent]> {
  const data = await request<any>(`/api/messages?conversation_id=${conversationId}`, 'GET', appCode);
  return data.data;
}

export async function getMyInfo(appCode: string): Promise<[ConversationContent]> {
  return await request<any>(`/agent/common/save-my-info`, 'GET', appCode);
}

export async function submitMyInfo(text: string, appCode: string): Promise<[ConversationContent]> {
  return await request<any>(`/agent/common/save-my-info`, 'POST', appCode, { text });
}

async function request<T>(
  url: string,
  method: string,
  appCode: string,
  body?: any
): Promise<T>  {
  const accessToken = getAccessToken(appCode)
  let options: any = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    }
  }

  if (method === 'POST') {
    options = {...options, body: JSON.stringify(body)}
  }

  try {
    const response = await fetch(url, options);
    if (response.status === 200) {
      const result = await response.json();
      return result
    } else {
      return await response.json();
    }
  } catch (e) {
    console.error(e);
    return e;
  }
}