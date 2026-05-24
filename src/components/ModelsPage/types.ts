import type { ModelInfo } from "@/composables/useProviderManager";
import type { ShowResponse } from "ollama/browser";

export type ModelViewInfo =
 | { state: 'data', model: ShowResponse, type: 'ollama' }
 | { state: 'data', model: ModelInfo, type: 'generic' }
 | { state: 'loading' }
 | { state: 'error', message: string }
 | { state: 'unselected' };
