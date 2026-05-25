<script setup lang="ts">
import type { ModelViewInfo } from '../types';

const props = defineProps<{
    modelFromParams: string | null,
    selectedModel: Extract<ModelViewInfo, { state: 'data' }>,
}>();
</script>

<template>
    <UIViewerContainer>
        <div class="text-2xl md:text-3xl mb-2 md:my-6 align-middle min-w-0 whitespace-normal">
            <IconModel :name="modelFromParams ?? 'Unknown'" class="size-8 md:size-14! inline mr-2" />

            <span class="text-base-100 font-bold mr-2">{{ selectedModel.modelName }}</span>
            <br>
            <span class="text-base-200 text-xl">{{ modelFromParams }}</span>
        </div>

        <ModelsPageCapabilitiesList :model-capabilities="selectedModel.capabilities" />

        <div class="relative">
            <h2 class="text-xl md:text-3xl pt-4 pb-2 text-base-100">Info</h2>
            <template
                v-for="[key, value] in Object.entries(selectedModel.attributes)"
                :key>
                <ModelsPageInfoSection
                    v-if="typeof value === 'string'"
                    :title="key"
                    :content="value" />
                <ModelsPageInfoSection
                    v-else-if="typeof value === 'object' && value !== null"
                    :title="key"
                    :kv-list="value as Record<string, unknown>" />
            </template>
        </div>
    </UIViewerContainer>
</template>