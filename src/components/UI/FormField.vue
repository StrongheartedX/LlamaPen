<script setup lang="ts">
import { Label } from 'reka-ui';

defineProps<{
    label: string;
    placeholder?: string;
    required?: HTMLInputElement['required'];
    list?: string;
}>();

const value = defineModel();
const id = useId();
</script>

<template>
    <div>
        <Label :for="id" >{{ label }}</Label>
        <UIInput 
            type="text" 
            :placeholder
            v-model="value"
            :required
            :list
            :id />
    </div>
</template>