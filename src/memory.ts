import { JSONFilePreset } from "lowdb/node"
import type { AIMessage } from '../types'
import { v4 as uuidv4 } from 'uuid'

export type MessageWithMetaData = AIMessage & {
    createdAt: string,
    id: string,
}

type Data = {
  messages: MessageWithMetaData[]
}

function addMetadata(message: AIMessage): MessageWithMetaData {
    return {
        ...message,
           id: uuidv4(),
        createdAt: Date.now().toString(),
     
    }
}

function removeMetadata(message: MessageWithMetaData): AIMessage {
    const { id, createdAt, ...rest} = message;
    return rest;
}

const defaultData: Data = { messages: [] }

const getDB = async () => {
 const db = await JSONFilePreset<Data>('db.json', defaultData)
 return db
}

export const getMessages = async () => {
 const db = await getDB()
  return db.data.messages.map(removeMetadata)
}

export const addMessages = async (messages: AIMessage[]) => {
const db = await getDB()
  db.data.messages.push(...messages.map(addMetadata))
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