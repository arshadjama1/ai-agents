import { JSONFilePreset } from 'lowdb/node'
import type { AIMessage } from '../types'
import { v4 as uuidv4 } from 'uuid'
import { summarizeMessages } from './llm'

export type MessageWithMetaData = AIMessage & {
  createdAt: string
  id: string
}

type Data = {
  messages: MessageWithMetaData[]
  summary: string
}

function addMetadata(message: AIMessage): MessageWithMetaData {
  return {
    ...message,
    id: uuidv4(),
    createdAt: Date.now().toString(),
  }
}

function removeMetadata(message: MessageWithMetaData): AIMessage {
  const { id, createdAt, ...rest } = message
  return rest
}

const defaultData: Data = { messages: [], summary: '' }

const getDB = async () => {
  const db = await JSONFilePreset<Data>('db.json', defaultData)
  return db
}

export const getMessages = async () => {
  const db = await getDB()
  const messages = db.data.messages.map(removeMetadata)
  const lastFive = messages.slice(-5)

  // If first message is a tool response, get one more message before it
  if (lastFive[0]?.role === 'tool') {
    const sixthMessage = messages[messages.length - 6]
    if (sixthMessage) {
      return [sixthMessage, ...lastFive]
    }
  }

  return lastFive
}

export const addMessages = async (messages: AIMessage[]) => {
  const db = await getDB()
  db.data.messages.push(...messages.map(addMetadata))

  if (db.data.messages.length >= 10) {
    const oldestMessages = db.data.messages.slice(0, 5).map(removeMetadata)

    const summary = await summarizeMessages(oldestMessages)
    db.data.summary = summary
  }
  await db.write()
}

export const saveToolResponse = async (
  toolCallId: string,
  toolResponse: string
) => {
  return await addMessages([
    { role: 'tool', content: toolResponse, tool_call_id: toolCallId },
  ])
}

export const getSummary = async () => {
  const db = await getDB()
  return db.data.summary
}
