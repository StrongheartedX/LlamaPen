import type { LLMProvider } from "../base/ProviderInterface";
import { LPCloudProvider } from "../lpcloud/LPCloudProvider";
import { OllamaProvider } from "../ollama/OllamaProvider";

export const isOllamaProvider = (provider: LLMProvider): provider is OllamaProvider => 
    provider instanceof OllamaProvider;

export const isLPCloudProvider = (provider: LLMProvider): provider is LPCloudProvider => 
    provider instanceof LPCloudProvider