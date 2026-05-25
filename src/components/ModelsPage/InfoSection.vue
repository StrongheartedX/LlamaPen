<script setup lang="ts">
defineProps<{
    content?: string;
    kvList?: Record<string, unknown | null> | null;
}>();

function formatValue(value: unknown | null) {
    if (value === null) {
        return 'null';
    }

    if (typeof value === 'string' && value.length === 0) {
        return '<empty string>';
    }

    return value;
}

</script>

<template>
    <div class="w-full p-2 mb-6 flex flex-col gap-2">
        <template v-if="kvList">
            <div  
                v-for="(value, key) in kvList" 
                :key
                class="flex flex-row text-sm font-medium">
                <div class="bg-base-700 text-primary p-2 rounded-l-lg">{{ key }}</div>
                <div 
                    class="bg-base-800 text-base-300 p-2 rounded-r-lg" 
                    :class="{ 
                        'italic font-normal text-base-400': value === null || (typeof value === 'string' && value.length === 0) 
                    }">
                    {{ formatValue(value) }}
                </div>
            </div>
        </template>

        <article 
            v-else
            class="prose prose-app! dark:prose-invert w-full min-w-full whitespace-pre-wrap break-all">
            {{ content }}
        </article>
    </div>
</template>