<script setup lang="ts">
interface Item { id: number; title: string; body: string; read: boolean; time: string }
defineProps<{ open: boolean; items: Item[] }>()
defineEmits<{ (e: 'update:open', v: boolean): void; (e: 'mark-all'): void }>()
</script>

<template>
  <Transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="open"
      class="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
    >
      <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <span class="text-sm font-semibold text-slate-900">Notifications</span>
          <button type="button" class="text-xs font-medium text-brand-700 hover:text-brand-900" @click="$emit('mark-all')">
          Tout marquer lu
        </button>
      </div>
      <ul class="max-h-72 divide-y divide-slate-100 overflow-y-auto">
        <li v-for="n in items" :key="n.id" class="px-4 py-3 transition hover:bg-slate-50">
          <div class="flex items-start gap-2">
            <span class="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" :class="n.read ? 'bg-slate-300' : 'bg-brand-600'" />
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-slate-900">{{ n.title }}</p>
              <p class="mt-0.5 text-xs text-slate-500">{{ n.body }}</p>
              <p class="mt-1 text-[10px] text-slate-400">{{ n.time }}</p>
            </div>
          </div>
        </li>
        <li v-if="!items.length" class="px-4 py-6 text-center text-sm text-slate-400">
          Aucune notification
        </li>
      </ul>
    </div>
  </Transition>
</template>
