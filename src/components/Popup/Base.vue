<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import { BiX } from 'vue-icons-plus/bi';

onMounted(() => {
    document.addEventListener('keyup', handleKeyUp)
});

onBeforeUnmount(() => {
    document.removeEventListener('keyup', handleKeyUp);
});

function handleKeyUp(e: KeyboardEvent) {
    if (e.key === 'Escape') {
        emit('close');
    }
}

const props = withDefaults(defineProps<{
    showing: boolean;
    closeButton?: boolean;
}>(), {
    closeButton: false
});

const emit = defineEmits<{
    close: []
}>();
</script>

<template>
    <div class="absolute top-0 left-0 w-full h-svh bg-black/50 z-99 motion-opacity-in-[75%] motion-duration-100" 
        aria-labelledby="popupTitle"
        aria-describedby="popupText"
        :class="{ 'hidden': !props.showing }">
        <div class="flex flex-col w-[calc(100%)-1rem] sm:w-xl lg:w-2xl h-auto sm:h-auto md:h-[60%] rounded-xl p-6 box-border bg-base-700 absolute top-1/2 left-1/2 -translate-1/2 shadow-elevation-5 z-100
            motion-scale-in-75 motion-opacity-in-[75%] motion-duration-100">
            <div
                v-if="closeButton"
                class="absolute top-0 right-0 p-3">
                <button 
                    class="p-2 size-10 hover:bg-base-800 rounded-full cursor-pointer"
                    @click="$emit('close')">
                    <BiX />
                </button>
            </div>
            <h2 
                id="popupTitle" 
                class="text-2xl font-bold flex flex-row items-center gap-2">
                <slot name="title">Popup</slot>
            </h2>
            <div 
                id="popupText" 
                class="mt-4 grow line-space overflow-hidden">
                <slot name="body"></slot>
            </div>
            <div class="*:mt-4 *:bg-primary *:text-base-700 *:font-semibold *:hover:bg-secondary *:transition-colors *:duration-dynamic *:w-36 *:h-12 *:rounded-md *:cursor-pointer
                flex flex-row gap-6">
                <slot name="buttons"></slot>
            </div>
        </div>
    </div>
</template>
