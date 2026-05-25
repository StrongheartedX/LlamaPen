export type ModelAttributes = Record<string, string | Record<string, unknown>>;

export type ModelViewInfo =
 |  { 
        state: 'data';
        modelName: string;
        modelId: string; 
        attributes: ModelAttributes;
        capabilities: string[];
    }
 | { state: 'loading' }
 | { state: 'error', message: string }
 | { state: 'unselected' };
