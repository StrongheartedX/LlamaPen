import type { ChatIteratorChunk, ChatOptions, ModelCapabilities } from "./types";
import type { ShowResponse } from "ollama/browser";
import type { Reactive, Ref } from "vue";
import type { ModelInfo } from "@/composables/useProviderManager";

export type ConnectionState = {
    status: 'connected' | 'disconnected' | 'checking' | 'error';
    error?: string;
    lastChecked?: Date;
}

export interface BaseLLMProvider {
    readonly name: string;
    readonly type: 'ollama' | 'lpcloud';
    readonly connectionState: Reactive<ConnectionState>;
    readonly rawModels: Ref<ModelInfo[]>;

    /**
     * Loads models from the provider and initialises capabilities.
     * @param force When false, if models were already loaded before, ignore the reqest. 
     * True overrides this and re-sends a request, aka refreshes.
     */
    loadModels(force: boolean): Promise<void>;

    /** 
     * Set the connection state to loading and re-send a network request to the provider's URL
     */
    refreshConnection(): Promise<void>;
    

    /**
     * Generates a chat response as a stream of chunks.
     * 
     * This needs major overhauling, currently we need to:
     * - Standardize ChatIteratorChunk across providers
     * 
     * @param messages Chat messages.
     * @param abortSignal AbortSignal to stop streaming.
     * @param options Client-side generation options.
     */
    chat(
        messages: ChatMessage[], 
        abortSignal: AbortSignal, 
        options: ChatOptions,
    ): Promise<AsyncIterable<ChatIteratorChunk>>;

    /**
     * Get the model 'capabilities', e.g. image inputs, thinking/reasoning, etc.
     * @param modelId Model to get capabilities for.
     */
    getModelCapabilities(modelId: string): ModelCapabilities;


    /**
     * Generates a chat title based on the provided chat messages. Uses JSON-structure outputs from model.
     * TODO: add a flag for provider to indicate if JSON-structure outputs are supported.
     * @param messages Chat messages to generate a title for
     */
    generateChatTitle(messages: ChatMessage[]): Promise<string>;
}

export interface OllamaLLMProvider extends BaseLLMProvider {
    readonly loadedModelIds: Ref<Set<string>>;
    refreshLoadedModels(): Promise<void>;
    
    /**
     * @param modelId The model to get details for.
     */
    getModelDetails(modelId: string): Promise<{ data: ShowResponse, error: null } | { data: null, error: string }>;

    /**
     * Loads a model into memory.
     * @param modelName The name of the model to load into memory.
     * @returns If the model was successfully loaded into memory.
     */
    loadModelIntoMemory(modelId: string): Promise<boolean>;

    /**
     * Unloads a model from memory.
     * @param modelName The name of the model to unload from memory.
     * @returns If the model was successfully unloaded from memory.
     */
    unloadModel(modelId: string): Promise<boolean>;
}

export interface LPCloudLLMProvider extends BaseLLMProvider {
    isSignedIn: boolean;
}

export type LLMProvider = BaseLLMProvider | OllamaLLMProvider;