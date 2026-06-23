import { defineStore } from 'pinia';

export type CustomProvider = {
    key: string;
    name: string;
    baseURL: string;
    apiKey: string;
};

export const useCustomProvidersStore = defineStore('customProvidersStore', () => {
    const providers = ref<CustomProvider[]>([]);

    function add(provider: Omit<CustomProvider, 'key'>): string {
        const key = `custom-${Date.now()}`;
        providers.value.push({ ...provider, key });
        return key;
    }

    function update(updatedFields: CustomProvider) {
        const providerKey = providers.value.find((p) => p.key === updatedFields.key);
        if (!providerKey) return;

        const newProvider: Omit<CustomProvider, 'key'> = {
            apiKey: updatedFields.apiKey,
            baseURL: updatedFields.baseURL,
            name: updatedFields.name,
        };

        Object.assign(providerKey, newProvider);
    }

    function remove(key: string) {
        const foundIndex = providers.value.findIndex((p) => p.key === key);
        if (foundIndex !== -1) providers.value.splice(foundIndex, 1);
    }

    return { providers, add, update, remove }
}, {
    persist: true,
});
