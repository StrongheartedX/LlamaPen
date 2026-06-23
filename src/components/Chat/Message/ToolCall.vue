<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { emitter } from '@/lib/mitt';
import { nanoid } from 'nanoid';
import { getMessageAttachments } from '@/utils/core/getMessageAttachments';
import { BiError } from 'vue-icons-plus/bi';

const props = defineProps<{
    message: ToolChatMessage;
}>();

const messageTextContainer = ref<HTMLDivElement | null>(null);

// === State ===
const images = ref<{ id: string; blobSrc: string; file: Blob }[]>([]);

onMounted(async () => {
    const messageAttachments = (await getMessageAttachments(props.message.id)).map(item => item.content);
    images.value = messageAttachments.map((attachment) => {
        return {
            id: nanoid(),
            blobSrc: URL.createObjectURL(attachment),
            file: attachment,
        }
    });

    messageTextContainer.value?.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('copy-code-button')) {
            const code = decodeURIComponent(target.dataset.code || "");
            navigator.clipboard.writeText(code);

            target.textContent = 'Copied!'
            setTimeout(() => {
                target.textContent = 'Copy';
            }, 1000);
        }
    })
})

</script>

<template>
    <div class="group/message flex flex-col" ref="messageTextContainer">
        <div class="box-border flex flex-col">
            <img 
                v-for="image of images" 
                :key="image.id" 
                :src="image.blobSrc"
                class="rounded-xl max-w-64 max-h-full cursor-pointer mb-2"
                @click="emitter.emit('openLightbox', { image: image.file })" alt="Message attached media" />

            <div class="relative">
                <div v-if="message.errorText" class="italic bg-danger/25 p-2 rounded-lg ring-1 ring-danger/50 text-danger">
                    <BiError class="inline mr-1 pb-0.5" />
                    <span class="text-center">{{ message.errorText }}</span>
                </div>
                <ChatMessageToolCallsMessage :message />
            </div>
        </div>
    </div>
</template>