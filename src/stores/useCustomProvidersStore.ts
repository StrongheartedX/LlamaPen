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

    function update(key: string, updatedFields: Partial<Omit<CustomProvider, 'key'>>) {
        const provider = providers.value.find((p) => p.key === key);
        if (provider) {
            Object.assign(provider, updatedFields);
        }
    }

    function remove(key: string) {
        const foundIndex = providers.value.findIndex((p) => p.key === key);
        if (foundIndex !== -1) providers.value.splice(foundIndex, 1);
    }

    return { providers, add, update, remove }
}, {
    persist: true,
});
