import type { BaseLLMProvider } from "../base/ProviderInterface";
import { LPCloudProvider } from "../lpcloud/LPCloudProvider";
import { OllamaProvider } from "../ollama/OllamaProvider";

export const isOllamaProvider = (provider: BaseLLMProvider): provider is OllamaProvider => 
    provider instanceof OllamaProvider;

export const isLPCloudProvider = (provider: BaseLLMProvider): provider is LPCloudProvider => 
    provider instanceof LPCloudProvider