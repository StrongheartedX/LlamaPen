import type { LLMProvider, LPCloudLLMProvider, OllamaLLMProvider } from "../base/ProviderInterface";

export const isOllamaProvider = (provider: LLMProvider): provider is OllamaLLMProvider => 
    provider.type === 'ollama';

export const isLPCloudProvider = (provider: LLMProvider): provider is LPCloudLLMProvider => 
    provider.type === 'lpcloud';