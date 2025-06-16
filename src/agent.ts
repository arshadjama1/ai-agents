import type { AIMessage } from "../types"
import { runLLM } from "./llm"
import { addMessages, getMessages, saveToolResponse } from "./memory"
import { runTool } from "./toolRunner"
import { logMessage, showLoader } from "./ui"

export const runAgent = async ({ userMessage, tools }: {userMessage: string, tools: any[]}) => {
    await addMessages([{ role: 'user', content: userMessage}])

    const loader = showLoader('...thinking')

    while(true) {
    const history = await getMessages()
    const response = await runLLM({messages: history, tools})


    if(response.content) {
        loader.stop();
           logMessage(response)

        return getMessages();
    }
    await addMessages([response])

     if (response.tool_calls) {
               logMessage(response)

    const toolCall = response.tool_calls[0]
    loader.update(`executing: ${toolCall.function.name}`)

    const toolResponse = await runTool(toolCall, userMessage)

    await saveToolResponse(toolCall.id, toolResponse)

    loader.update(`executed: ${toolCall.function.name}`)
  }
    }
 
}