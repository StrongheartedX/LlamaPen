import type { ChatIteratorChunk, ChatOptions } from "../base/types";
import { lpCloudWrapper } from "./LPCloudWrapper";
import { reactive, ref, type Reactive, type Ref } from "vue";
import type { ConnectionState, LPCloudLLMProvider } from "../base/ProviderInterface";
import { BaseProvider } from "../base/BaseProvider";
import type { ModelCapability, ModelInfo } from "@/composables/useProviderManager";
import { appMessagesToLPCloud } from "./converters/appMessagesToLPCloud";
import { chat } from "./helpers/chat";
import * as helpers from "./helpers/generateChatTitle";
import useCloudUserStore from "@/stores/useCloudUserStore";
import { useConfigStore } from "@/stores/useConfigStore";
import type { ModelAttributes } from "@/components/ModelsPage/types";


export class LPCloudProvider extends BaseProvider implements LPCloudLLMProvider {
    readonly name = "LlamaPen Cloud";
    readonly type = 'lpcloud';

    readonly rawModels: Ref<ModelInfo[]> = ref([]);

    readonly connectionState: Reactive<ConnectionState> = reactive({
        status: 'disconnected',
        error: undefined,
        lastChecked: undefined
    });

    public get isSignedIn() {
        return useCloudUserStore().isSignedIn;
    }

    protected onModelsLoaded(): void {
        for (const model of this.rawModels.value) {
            this.fetchedCapabilities.value.set(
                model.info.id, 
                model.info.capabilities
            );
        }
    }

    public async refreshConnection(): Promise<void> {
        this.connectionState.status = 'checking';

        const returnedError = await lpCloudWrapper.checkConnection();

        if (returnedError) {
            this.connectionState.status = 'error';
            this.connectionState.error = returnedError.message;
        } else {
            this.connectionState.status = 'connected';
            this.connectionState.error = undefined;
            this.connectionState.lastChecked = new Date();
        }
    }

    public async chat(messages: ChatMessage[], abortSignal: AbortSignal, options: ChatOptions): Promise<AsyncIterable<ChatIteratorChunk>> {
        const ollamaFormatMessages = await appMessagesToLPCloud(messages);
        return chat(ollamaFormatMessages, abortSignal, options);
    }
    
    public async getModels(): Promise<ModelInfo[]> {
        const configStore = useConfigStore();
        const list = await lpCloudWrapper.list();

        return list.map((m) => {
            const displayName = configStore.chat.modelRenames[m.model] || m.name;
            const isHidden = configStore.chat.hiddenModels.includes(m.model);

            return {
                displayName,
                hidden: isHidden,
                info: {
                    name: m.name,
                    id: m.model,
                    subtitle: m.llamapenMetadata.creator,
                    capabilities: m.capabilities,
                    providerMetadata: {
                        provider: 'lpcloud',
                        data: {
                            premium: m.llamapenMetadata.premium ?? false,
                            priceTier: m.llamapenMetadata.priceTier,
                            providerName: m.llamapenMetadata.creator,
                            tags: m.llamapenMetadata.tags ?? [],
                        },
                    }
                }
            }
        });
    }

    public getModelCapabilities(modelId: string): ModelCapability[] {
        return this.fetchedCapabilities.value.get(modelId) || [];
    }

    public async getModelAttributes(modelId: string): Promise<ModelAttributes> {
        const model = this.rawModels.value.find(m => m.info.id === modelId);
        if (!model || model.info.providerMetadata?.provider !== 'lpcloud') return {};

        const priceMap = {
            0: 'Very Low',
            1: 'Low',
            2: 'Medium',
            3: 'High',
            4: 'Very High',
        };

        const reasoningMode = (() => {
            if (model.info.providerMetadata.data.tags?.includes('alwaysReasons')) return 'Always reasons';
            if (model.info.capabilities.includes('thinking')) return 'Toggleable';
            return 'None';
        })();

        return {
            'Metadata': {
                'Provider': model.info.providerMetadata.data.providerName,
                'Premium': model.info.providerMetadata.data.premium ? 'Yes' : 'No',
                'Price tier': priceMap[model.info.providerMetadata.data.priceTier] || 'Unknown',
            },
            'Tags': {
                'Openness': model.info.providerMetadata.data.tags?.includes('closedSource') ? 'Closed-source' : 'Open-source',
                'Reasoning mode': reasoningMode,
            }
        };
    }

    public async generateChatTitle(messages: ChatMessage[]): Promise<string> {
        return await helpers.generateChatTitle(messages);
    }
}