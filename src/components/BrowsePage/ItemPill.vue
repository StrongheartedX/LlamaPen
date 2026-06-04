<script setup lang="ts">
defineProps<{
    tooltip: string;
}>();
</script>

<template>
    <Tooltip 
        size="small"
        :text="tooltip">
        <span class="select-none text-xs font-medium flex flex-row items-center gap-1 bg-base-800 p-0.5 px-2 rounded-full ring-inset ring-1 ring-base-700">
            <slot />
        </span>
    </Tooltip>
</template>