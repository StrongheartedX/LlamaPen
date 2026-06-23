import type OpenAI from "openai";

type OpenAIChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export function convertMessagesToOpenAI(messages: ChatMessage[]): OpenAIChatMessage[] {
    return messages.map((message) => {
        if (message.type === 'user') {
            return {
                role: 'user',
                content: message.content,
            } as OpenAIChatMessage;
        }

        if (message.type === 'tool') {
            return {
                role: 'tool',
                content: message.content,
                tool_call_id: message.toolCallId ?? `call_${message.chatId}_${message.id}`
            } as OpenAIChatMessage;
        }

        return {
            role: 'assistant',
            content: message.content,
            tool_calls: message.toolCalls?.map((toolCall) => ({
                id: toolCall.id,
                type: 'function',
                function: {
                    name: toolCall.function.name,
                    arguments: JSON.stringify(toolCall.function.arguments),
                }
            })),
        } as OpenAIChatMessage;
    });
}

type OpenAIRequestTools = OpenAI.Chat.Completions.ChatCompletionTool;

export function convertToolsToOpenAI(tools: AppTools, toggledTools: string[]): OpenAIRequestTools[] {
    return Object.entries(tools)
        .filter(([toolId, _tool]) => toggledTools.includes(toolId))
        .map(([toolId, tool]) => ({
            type: 'function',
            function: {
                name: toolId,
                description: tool.description,
                strict: true,
                parameters: {
                    type: 'object',
                    properties: Object.fromEntries(
                        tool.params.map((param) => [
                            param.name,
                            {
                                type: param.type,
                                description: param.description,
                                ...(param.enum?.length && { enum: param.enum }),
                            }
                        ]
                    )),
                    required: tool.required,
                }
            }
        }));
}