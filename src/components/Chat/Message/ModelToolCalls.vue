<script setup lang="ts">
import { ref } from 'vue';
import { BiChevronDown, BiChevronUp, BiWrench } from 'vue-icons-plus/bi';

defineProps<{
	message: ModelChatMessage,
}>();

const showing = ref(false);
</script>

<template>
	<template v-if="message.toolCalls">
		<div class="w-[calc(100%-1rem)] h-px mx-2 mb-2 bg-base-300/50"></div>
		<div class="w-full flex flex-col bg-base-800 rounded-lg">
			<div 
				class="p-2 px-3 flex flex-row gap-2 items-center select-none cursor-pointer" 
				@click="showing = !showing">
				<BiWrench class="size-4" />
				<span>
					{{ message.toolCalls.length }} tool call{{ message.toolCalls.length > 1 ? '(s)' : '' }}
				</span>
				<div class="ml-auto">
					<BiChevronDown v-if="!showing" />
					<BiChevronUp v-else />
				</div>
			</div>
			<div v-if="showing">
				<div 
					v-for="call, index in message.toolCalls" 
					:key="index" 
					class="bg-base-700 m-2 p-2 mt-0 rounded-sm group cursor-pointer">
					<code class="font-medium text-base-100">
						{{ call.function.name }}
					</code>
					
					<ul>
						<li 
							v-for="[key, value] in Object.entries(call.function.arguments)" 
							:key="key"
							class="text-sm pt-1 list-disc list-inside">
							<span>{{ key }}: </span>
							<code class="bg-base-800 py-0.5 px-1 rounded-sm">{{ value }}</code>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</template>
</template>