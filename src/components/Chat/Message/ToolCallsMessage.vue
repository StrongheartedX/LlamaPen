<script setup lang="ts">
import { ref } from 'vue';
import { BiLoaderAlt, BiSolidCheckSquare, BiChevronDown, BiChevronUp } from 'vue-icons-plus/bi';

defineProps<{
    message: ToolChatMessage
}>();

const showing = ref<boolean>(false);
</script>

<template>
    <div 
        class="flex flex-col cursor-pointer bg-base-800 rounded-lg p-2 my-2 mx-4" 
        @click="showing = !showing">
        <div class="flex flex-row items-center mr-1">
            <span class="font-medium">
                <component 
                    :is="message.completed ? BiSolidCheckSquare : BiLoaderAlt" 
                    class="size-5 mr-1 inline" 
                    :class="{ 'animate-spin': !message.completed }" />
                <span class="align-middle">
                    {{ message.toolName }}
                </span>
            </span>
            <span 
                class="ml-auto text-sm"
                :title="message.completed?.toLocaleString() ?? ''">
                <template v-if="message.completed">
                    Done ({{ ((message.completed.getTime()  - message.created.getTime()) / 1000).toFixed(2) }}s)
                </template>
                <template v-else>
                    Processing...
                </template>
            </span>
            <div 
                v-if="message.completed">
                <BiChevronDown v-if="!showing" />
                <BiChevronUp v-else />
            </div>
        </div>
        <div 
            v-if="showing"
            class="mt-1">
            <span class="text-sm">Result:</span>
            <pre class="max-w-full whitespace-pre-wrap wrap-break-word bg-base-700 py-1 px-2 rounded-sm">{{ message.content }}</pre>
        </div>
    </div>
</template>