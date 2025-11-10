import { configureStore } from '@reduxjs/toolkit'
import exampleReducer from './modules/example'
import loginReducer from './modules/login'
import conversationReducer from './modules/conversation'
import sessionReducer from './modules/session'

const store = configureStore({
  reducer: {
    example: exampleReducer,
    login: loginReducer,
    conversation: conversationReducer,
    session: sessionReducer
  }
})

export type IRootState = ReturnType<typeof store.getState>
export type DispatchType = typeof store.dispatch

export default store
