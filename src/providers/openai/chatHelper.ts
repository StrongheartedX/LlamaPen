import type { ChatIteratorChunk, ChatOptions } from "@/providers/base/types";
import useToolsStore from "@/stores/useToolsStore";
import type OpenAI from "openai";
import { convertMessagesToOpenAI, convertToolsToOpenAI } from "./openAIConverters";

/**
 * 
 * @param messages Messages to use as context.
 * @param abortSignal Abort signal to cancel generation.
 * @param additionalOptions Client-side generation options
 * @returns Yields chunks normally. Throws if control flow error.
 */
export async function* chatHelper(
    messages: ChatMessage[],
    abortSignal: AbortSignal,
    options: ChatOptions,
    instance: OpenAI,
): AsyncGenerator<ChatIteratorChunk, ChatIteratorChunk | undefined, unknown> {
    const toolsStore = useToolsStore();

    const response = await instance.chat.completions.create({
        model: options.model,
        messages: convertMessagesToOpenAI(messages),
        stream: true,
        ...(toolsStore.toggled.length > 0 &&
            { tools: convertToolsToOpenAI(toolsStore.tools, toolsStore.toggled) }
        ),
    }, {
        signal: abortSignal,
    });

    for await (const chunk of response) {
        if (abortSignal.aborted) {
            return { type: 'done', reason: 'cancelled' };
        }

        if (!chunk.choices.length) continue;

        if (chunk.choices[0].finish_reason) {
            yield { 
                type: 'message',
                content: chunk.choices[0].delta.content || '',
                thinking: '',
            };

            yield {
                type: 'done',
                reason: chunk.choices[0].finish_reason === 'stop' ? 'completed' : 'error',
            };

            continue;
        }

        yield {
            type: 'message',
            content: chunk.choices[0].delta.content || '',
            thinking: '',
        };
    }
}
