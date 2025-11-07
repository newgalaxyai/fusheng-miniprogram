export type IStreamName =
  | 'conversation_id'
  | 'keywords'
  | 'start_thinking'
  | 'thinking'
  | 'end_thinking'
  | 'start_text'
  | 'text'
  | 'end_text'
  | 'start_table'
  | 'json'
  | 'end_table'

export interface IStreamEvent<T = any> {
  name: IStreamName
  data: T
}

export interface IStreamAIAnswerRequest {
  query: string
  response_mode: 'streaming'
  conversation_id?: string
  target_company_name?: string
  target_company_serve?: string
}