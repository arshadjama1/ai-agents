import type OpenAI from 'openai'
import { tools } from './tools'
import {
  generateImage,
  generateImageToolDefinition,
} from './tools/generateImage'
import { reddit, redditToolDefinition } from './tools/reddit'
import { dadJoke, dadJokeToolDefinition } from './tools/dadJoke'
import { movieSearch, movieSearchToolDefinition } from './tools/movieSearch'

export const runTool = async (
  toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
  userMessage: string
) => {
  const input = {
    userMessage,
    toolArgs: JSON.parse(toolCall.function.arguments),
  }
  switch (toolCall.function.name) {
    case generateImageToolDefinition.name:
      return generateImage(input)
    case redditToolDefinition.name:
      return reddit(input)
    case dadJokeToolDefinition.name:
      return dadJoke(input)
    case movieSearchToolDefinition.name:
      return movieSearch(input)
    default:
      return `Never run this tools: ${toolCall.function.name} again, or else!`
  }
}
