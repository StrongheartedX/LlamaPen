import { ref, type Ref } from "vue";
import type { BaseLLMProvider } from "./ProviderInterface";
import type { ChatIteratorChunk, ChatOptions, Model, ModelCapabilities } from "./types";
import { useConfigStore } from "@/stores/config";
import type { ModelInfo } from "@/composables/useProviderManager";
import logger from "@/lib/logger";

export abstract class BaseProvider implements BaseLLMProvider {
    abstract readonly name: string;
    abstract readonly type: 'ollama' | 'lpcloud';
    abstract readonly connectionState: BaseLLMProvider['connectionState'];

    abstract readonly rawModels: Ref<ModelInfo[]>;
    protected readonly fetchedCapabilities = ref<Map<string, ModelCapabilities>>(new Map());
    
    private initialised = ref(false);
    private loadPromise: Promise<void> | null = null;

    private transformModel(model: Model): ModelInfo {
        const modelId = model.id;

        const displayName = 
            useConfigStore().chat.modelRenames[modelId] ||
            model.name ||
            modelId;

        const isHidden = useConfigStore().chat.hiddenModels.includes(modelId);

        return {
            info: model,
            displayName,
            hidden: isHidden,
        }
    }

    async loadModels(force: boolean = false): Promise<void> {
        if (this.initialised.value && !force) return;
        if (this.loadPromise) return this.loadPromise;

        if (this.connectionState.status === 'error') {
            return;
        }

        this.loadPromise = (async () => {
            try {
                this.rawModels.value = (await this.getModels()).map(this.transformModel);
                
                try {
                    await this.onModelsLoaded();
                } catch (error) {
                    logger.error('BaseProvider:loadModels', `Error running onModelsLoaded for ${this.name}:`, error);
                }
            }  finally {
                this.initialised.value = true;
                this.loadPromise = null;
            }
        })();

        return this.loadPromise;
    }

    /**
     * Hook for provider-specific logic after models are loaded with no errors.
     * E.g. used in Ollama to fetch capabilites for each model.
     */
    protected onModelsLoaded(): Promise<void> | void {
        // Override in subclasses if needed
    }


    /**
     * Run connectivity check to provider.
     */
    public abstract refreshConnection(): Promise<void>;

    /**
     * Send a chat request to the provider.
     * @param messages The chat messages to use as context.
     * @param abortSignal AbortSignal for if user cancells.
     * @param options Chat parameters.
     * @returns An iterable list of response chunks as they come in.
     */
    public abstract chat(
        messages: ChatMessage[],
        abortSignal: AbortSignal,
        options: ChatOptions
    ): Promise<AsyncIterable<ChatIteratorChunk>>;

    public abstract getModels(): Promise<Model[]>;

    /**
     * Get the capabilities for a specific model.
     * @param modelId Model ID to check capabilities for. E.g. `gemma4:e4b`
     */
    public abstract getModelCapabilities(modelId: string): ModelCapabilities;

    /**
     * Generate the title to a chat using a provider's model.
     * @param messages Messages to use as context for the chat title generation.
     */
    public abstract generateChatTitle(messages: ChatMessage[]): Promise<string>;
}