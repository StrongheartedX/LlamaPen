<script setup lang="ts">
import { Label } from 'reka-ui';


const emit = defineEmits<{
    'select-preset': [preset: { name: string, baseURL: string, apiKey: string }];
}>();

const presets: Record<string, { name: string, baseURL: string, apiKey: string }> = {
    llamacpp: {
        name: 'llama.cpp',
        baseURL: 'http://127.0.0.1:8080/v1',
        apiKey: 'unusedkey',
    },
    lmstudio: {
        name: 'LM Studio',
        baseURL: 'http://localhost:1234/v1',
        apiKey: 'unusedkey',
    },
    vllm: {
        name: 'vLLM',
        baseURL: 'http://localhost:8000/v1',
        apiKey: 'vllm-key',
    },

    openai: {
        name: 'OpenAI',
        baseURL: 'https://api.openai.com/v1',
        apiKey: '',
    },
    openrouter: {
        name: 'OpenRouter',
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: '',
    },
    groq: {
        name: 'Groq',
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: '',
    },
    together: {
        name: 'Together',
        baseURL: 'https://api.together.ai/v1',
        apiKey: '',
    },
    deepseek: {
        name: 'DeepSeek',
        baseURL: 'https://api.deepseek.com',
        apiKey: '',
    }
};

function onSelect(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    const preset = presets[value];

    if (preset) {
        emit('select-preset', preset);
    }
}

const selectedPreset = defineModel<string>('selected-preset');

const id = useId();
</script>

<template>
    <div class="mt-2">
        <Label :for="id">Preset</Label>
        <select
            class="w-full bg-base-800 px-6 py-4 rounded-md outline-none ring ring-inset ring-base-600 focus:ring-base-300"
            :id
            v-model="selectedPreset"
            @change="onSelect">
            <option value="" disabled>Select a preset</option>

            <optgroup label="Self-hosted">
                <option value="llamacpp">llama.cpp</option>
                <option value="lmstudio">LM Studio</option>
                <option value="vllm">vLLM</option>
            </optgroup>

            <optgroup label="Cloud">
                <option value="openai">OpenAI</option>
                <option value="openrouter">OpenRouter</option>
                <option value="groq">Groq</option>
                <option value="together">Together AI</option>
                <option value="deepseek">DeepSeek</option>
            </optgroup>

            <option value="custom">Custom</option>
        </select>
    </div>
</template>