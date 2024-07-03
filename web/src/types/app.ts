import { WorkFlowResponse } from "@/api/sse"
import { UOMessageMeta } from "@/components/user-option-ui/type"

export type AppInfo = {
  // from url
  code: string

  app_id: string
  can_replace_logo?: boolean
  custom_config?: Record<string, any>
  enable_site?: boolean
  end_user_id?: string

  // in site
  title: string
  icon?: string
  icon_background?: string
  description?: string
  default_language?: any
  prompt_public?: boolean
  copyright?: string
  privacy_policy?: string
  custom_disclaimer?: string

  // in parameter
  opening_statement: string
  suggested_questions: string[]
}

export type ConversationData = {
  id: string,
  introduction: string,
  name: string,
}

// content contains both query and answer
// will be splitted before rendering
export type ConversationContent = {
  id: string,
  conversation_id: string,
  query: string,
  answer: string,
}

export type ConversationItem = {
  id: string, // message id
  type: 'Q' | 'A',
  content: string,
  workflow?: WorkFlowResponse,
  meta?: UOMessageMeta
}