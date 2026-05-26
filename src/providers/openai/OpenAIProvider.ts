import type { ModelInfo } from "@/composables/useProviderManager";
import { BaseProvider } from "../base/BaseProvider";
import type { Reactive } from "vue";
import type { ConnectionState } from "../base/ProviderInterface";
import type { ChatOptions, ChatIteratorChunk } from "../base/types";
import type { ModelAttributes } from "@/components/ModelsPage/types";
import { OpenAI } from "openai";
import { chatHelper } from "./chatHelper";

export class OpenAIProvider extends BaseProvider {
    readonly name = "OpenAI";
    readonly type = 'openai';

    readonly rawModels: Ref<ModelInfo[], ModelInfo[]> = ref([]);

    readonly connectionState: Reactive<ConnectionState> = reactive({
        status: 'disconnected',
        error: undefined,
        lastChecked: undefined
    });

    private client: OpenAI;

    constructor(baseURL: string, apiKey: string) {
        super();
        
        this.client = new OpenAI({
            apiKey,
            baseURL,
            dangerouslyAllowBrowser: true,
        });
    }

    public async refreshConnection(): Promise<void> {
        // Do nothing right now
        this.connectionState.status = 'connected';

        return;
    }

    public async chat(messages: ChatMessage[], abortSignal: AbortSignal, options: ChatOptions): Promise<AsyncIterable<ChatIteratorChunk>> {
        return chatHelper(messages, abortSignal, options, this.client);
    }

    public getModelCapabilities(_modelId: string): string[] {
        return [];
    }

    public async getModelAttributes(modelId: string): Promise<ModelAttributes> {
        const model = this.rawModels.value.find(m => m.info.id === modelId);
        if (!model || model.info.providerMetadata?.provider !== 'openai') return {};

        return {
            'Metadata': {
                'Created': model.info.providerMetadata.data.created.toLocaleString(),
                'Owned By': model.info.providerMetadata.data.ownedBy,
            }
        }
    }

    public async generateChatTitle(_messages: ChatMessage[]): Promise<string> {
        // TODO: implement this
        return "Generated Title";
    }

    protected async getModels(): Promise<ModelInfo[]> {
        const models = await this.client.models.list();

        return models.data.map((model) => {
            return {
                displayName: model.id,
                hidden: false,
                info: {
                    capabilities: [],
                    id: model.id,
                    name: model.id,
                    subtitle: model.owned_by,
                    providerMetadata: {
                        provider: 'openai',
                        data: {
                            created: new Date(model.created * 1000),
                            ownedBy: model.owned_by,
                        }
                    }
                }
            }
        });
    }
}