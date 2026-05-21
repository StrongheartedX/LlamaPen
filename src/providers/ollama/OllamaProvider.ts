import { chat, generateChatTitle } from "./helpers";
import type { ChatIteratorChunk, ChatOptions, Model, ModelCapabilities } from "../base/types";
import { appMesagesToOllama } from "./converters/appMessagesToOllama";
import { ollamaWrapper } from "./OllamaWrapper";
import type { ShowResponse } from "ollama/browser";
import { reactive, ref, type Reactive } from "vue";
import type { ConnectionState, OllamaLLMProvider } from "../base/ProviderInterface";
import { BaseProvider } from "../base/BaseProvider";
import { useConfigStore } from "@/stores/config";
import type { ModelInfo } from "@/composables/useProviderManager";

/**
 * Interfaces with the Ollama wrapper before packaging responses into the common app standard.
 */
export class OllamaProvider extends BaseProvider implements OllamaLLMProvider {
    readonly name = "Ollama";
    readonly type = 'ollama';

    readonly rawModels = ref<ModelInfo[]>([]);
    readonly loadedModelIds = ref<Set<string>>(new Set());

    readonly hasOllamaFeatures = true as const;

    readonly connectionState: Reactive<ConnectionState> = reactive({
        status: 'disconnected',
        error: undefined,
        lastChecked: undefined
    });


    protected async onModelsLoaded(): Promise<void> {
        await this.refreshLoadedModels();

        this.rawModels.value = this.rawModels.value.map(m => {
            return {
                ...m,
                subtitle: m.info.id,
            };
        });

        const config = useConfigStore();
        const shouldAutoloadCapabilities = !config.cloud.enabled &&
            (
                config.ollama.modelCapabilities.autoload && this.rawModels.value.length < 31
                || config.ollama.modelCapabilities.alwaysAutoload
            );

        if (shouldAutoloadCapabilities) {
            for (const model of this.rawModels.value) {
                const capabilities = await this.fetchModelCapabilities(model.info.id);
                this.fetchedCapabilities.value.set(model.info.id, capabilities);
            }
        }
    }

    public async refreshConnection(): Promise<void> {
        this.connectionState.status = 'checking';

        const { error } = await ollamaWrapper.version();

        if (error) {
            this.connectionState.status = 'error';
            this.connectionState.error = error.message;
        } else {
            this.connectionState.status = 'connected';
            this.connectionState.error = undefined;
            this.connectionState.lastChecked = new Date();
        }
    }


    public async chat(messages: ChatMessage[], abortSignal: AbortSignal, options: ChatOptions): Promise<AsyncIterable<ChatIteratorChunk>> {
        const ollamaFormatMessages = await appMesagesToOllama(messages);
        return chat(ollamaFormatMessages, abortSignal, options);
    }

    public async getModels(): Promise<Model[]> {
        const list = await ollamaWrapper.list();

        return list.map((m) => {
            return {
                name: m.name,
                id: m.model,
                subtitle: m.details.parameter_size,
                capabilities: {
                    supportsFunctionCalling: false,
                    supportsReasoning: false,
                    supportsVision: false,
                },
                providerMetadata: {
                    provider: 'ollama',
                    data: {
                        size: m.size,
                        parameterSize: m.details.parameter_size,
                        family: m.details.family,
                        modifiedAt: m.modified_at,
                        quantization: m.details.quantization_level,
                    }
                }
            }
        });
    }

    public getModelCapabilities(modelId: string): ModelCapabilities {
        return this.fetchedCapabilities.value.get(modelId) ?? {
            supportsFunctionCalling: false,
            supportsReasoning: false,
            supportsVision: false,
        };
    }

    public async generateChatTitle(messages: ChatMessage[]): Promise<string> {
        return generateChatTitle(messages);
    }

    async refreshLoadedModels(): Promise<void> {
        const loadedModels = await ollamaWrapper.ps();
        if (!loadedModels) {
            this.loadedModelIds.value = new Set();
            return;
        }

        this.loadedModelIds.value = new Set(loadedModels.map(model => model.model));
    }

    async loadModelIntoMemory(modelId: string): Promise<boolean> {
        return await ollamaWrapper.loadIntoMemory(modelId);
    }

    async unloadModel(modelId: string): Promise<boolean> {
        return await ollamaWrapper.unloadFromMemory(modelId);
    }


    async getModelDetails(modelId: string): Promise<{ data: ShowResponse, error: null } | { data: null, error: string }> {
        const { data: modelInfo, error } = await ollamaWrapper.show({ model: modelId });
        if (error) {
            return { data: null, error: error.message };
        }

        return { data: modelInfo, error: null };
    }

    private async fetchModelCapabilities(modelId: string): Promise<ModelCapabilities> {
        // 'completion' | 'tools' | 'thinking' | 'vision' | 'insert' | 'embedding' | 'search'

        const { data: modelInfo, error } = await ollamaWrapper.show({ model: modelId });
        if (error || !modelInfo) {
            return {
                supportsFunctionCalling: false,
                supportsReasoning: false,
                supportsVision: false,
            };
        }

        const capabilities = modelInfo.capabilities;

        return {
            supportsReasoning: capabilities.includes('thinking'),
            supportsVision: capabilities.includes('vision'),
            supportsFunctionCalling: capabilities.includes('tools'),
        }
    }
}