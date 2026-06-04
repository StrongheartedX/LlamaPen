<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { emitter } from '@/lib/mitt';
import { useCustomProvidersStore } from '@/stores/useCustomProvidersStore';
import { useProviderManager } from '@/composables/useProviderManager';
import { useConfigStore } from '@/stores/useConfigStore';

const config = useConfigStore();
const customProvidersStore = useCustomProvidersStore();
const { 
    currentProviderId, 
    setActiveProvider, 
} = useProviderManager();

const isShowing = ref(false);

const providerKey = ref<string | null>(null);
const newProvider = ref({ name: '', baseURL: '', apiKey: '' });

const selectedProvider = computed({
    get() {
        return currentProviderId.value;
    },

    set(newValue: string) {
        setActiveProvider(newValue);

        if (newValue === 'lpcloud') {
            config.cloud.enabled = true;
        } else {
            config.cloud.enabled = false;
        }
     
        // todo(qol, p=l): refresh connection status and load models instead of refreshing page
        // refreshAndLoadModels
        location.reload();
    }
});

onMounted(() => {
	emitter.on('upsertProviderPopup', (provider) => {
        if (provider) {
            const { key, name, baseURL, apiKey } = provider;
            providerKey.value = key;

            newProvider.value = { 
                name: name ?? '',
                baseURL: baseURL ?? '',
                apiKey: apiKey ?? ''
            };
        }

		isShowing.value = true;
	});
});

onUnmounted(() => {
	emitter.off('upsertProviderPopup');
});

function hide() {
    providerKey.value = null;
    selectedPreset.value = '';
    newProvider.value = { name: '', baseURL: '', apiKey: '' };
	isShowing.value = false;
}

function addCustomProvider() {
    if (!newProvider.value.name || !newProvider.value.baseURL || !newProvider.value.apiKey) {
        alert('Name, Base URL, and API key are required');
        return;
    }

    if (providerKey.value) {
        customProvidersStore.update(providerKey.value, { ...newProvider.value });
        providerKey.value = null;
    } else {
        customProvidersStore.add({ ...newProvider.value });
        newProvider.value = { name: '', baseURL: '', apiKey: '' };
    }

    customProvidersStore.$persist();
    location.reload();
}

function removeCustomProvider() {
    if (!providerKey.value) return;

    if (selectedProvider.value === providerKey.value) selectedProvider.value = 'ollama';
    customProvidersStore.remove(providerKey.value);
    customProvidersStore.$persist();
    location.reload();
}

const selectedPreset = ref<string>('');
const applyingPreset = ref(false);

function onSelectPreset(preset: { name: string, baseURL: string, apiKey: string }) {
    applyingPreset.value = true;
    newProvider.value = preset;
    nextTick(() => { applyingPreset.value = false; });
}

watch(() => newProvider.value.baseURL, () => {
    if (!applyingPreset.value && selectedPreset.value && selectedPreset.value !== 'custom') {
        selectedPreset.value = 'custom';
    }
});
</script>


<template>
	<PopupBase
        :showing="isShowing"
        :close-button="true"
        @close="hide">
		<template #title>
			{{ providerKey ? `Editing '${newProvider.name}'` : 'Add a provider' }}
		</template>
		<template #body>
			<div class="flex flex-col">
				<p 
                    v-if="!providerKey"
                    class="text-base-300 text-sm mb-2">
                    Works with any OpenAI-compatible API
                </p>

                <PopupAddProviderPresetsSelector
                    v-if="!providerKey"
                    v-model:selected-preset="selectedPreset"
                    @select-preset="onSelectPreset" />

                <UIFormField
                    label="Provider Name"
                    v-model="newProvider.name" 
                    placeholder="E.g. llama.cpp"
                    tooltip="The name of the provider in the list." />
                <UIFormField
                    label="Base URL"
                    v-model="newProvider.baseURL" 
                    placeholder="E.g. http://127.0.0.1:8080/v1"
                    tooltip="The OpenAI-compatible base URL to send requests to." />
                <UIFormField
                    label="API Key"
                    type="password"
                    v-model="newProvider.apiKey" 
                    placeholder="sk-..."
                    tooltip="API key to use in requests. Required regardless of if it's actually used by the provider." />
			</div>
		</template>
		<template #buttons>
            <button
                v-if="providerKey"
                @click="removeCustomProvider">Remove</button>
            <button 
                class="ml-auto" 
                @click="addCustomProvider">
                {{ providerKey ? 'Save' : 'Add' }}
            </button>
		</template>
	</PopupBase>
</template>