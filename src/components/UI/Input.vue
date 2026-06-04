<script setup lang="ts">
withDefaults(defineProps<{
    type?: HTMLInputElement['type'];
    placeholder?: string;
    required?: HTMLInputElement['required'];
    list?: string;
}>(), {
    type: 'text',
});

const value = defineModel();
</script>

<template>
    <input 
        :type
        :placeholder
        class="w-full bg-base-800 px-6 py-4 rounded-md outline-none ring-1 ring-inset ring-base-600 focus:ring-base-300"
        v-model="value"
        :required
        :list />
</template>