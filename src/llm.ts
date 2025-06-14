import type { AIMessage } from "../types";
import { openai } from "./ai";

export async function runLLM({ messages } : { messages: AIMessage[] }) {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.1,
        messages,
    })

    return response.choices[0].message.content
}
