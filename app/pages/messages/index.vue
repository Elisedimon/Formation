<script setup lang="ts">
definePageMeta({ middleware: ['auth'], layout: 'default' })

const { user, fetchMe } = useAuth()
onMounted(() => { if (!user.value) void fetchMe() })

const { data: discussionsData, pending, refresh: refreshDiscussions } = await useFetch('/api/discussions')
const discussions = computed(() => discussionsData.value?.discussions || [])

const selectedId = ref<string | null>(null)
const selected = ref<any>(null)
const loadingThread = ref(false)
const scrollToBottom = ref(0)

async function openDiscussion(d: any) {
  selectedId.value = d.id
  loadingThread.value = true
  try {
    const res = await $fetch<{ discussion: any }>(`/api/discussions/${d.id}`)
    selected.value = res.discussion
    scrollToBottom.value = Date.now()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Erreur.')
  } finally {
    loadingThread.value = false
  }
}

const newMessage = ref('')
const sending = ref(false)
async function sendMessage() {
  if (!selectedId.value || !newMessage.value.trim()) return
  sending.value = true
  try {
    await $fetch(`/api/discussions/${selectedId.value}/messages`, { method: 'POST', body: { content: newMessage.value.trim() } })
    newMessage.value = ''
    await openDiscussion({ id: selectedId.value })
    await refreshDiscussions()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Erreur.')
  } finally {
    sending.value = false
  }
}

function insertEmoji(emoji: string) {
  newMessage.value += emoji
}

const showCreate = ref(false)
const courses = ref<any[]>([])
const createForm = reactive({ courseId: '', subject: '' })
const creating = ref(false)
async function loadCourses() {
  try {
    const res = await $fetch<{ courses: any[] }>('/api/courses')
    courses.value = res.courses || []
  } catch {}
}
function otherName(d: any) {
  if (!d) return 'Utilisateur'
  const other = user.value?.role === 'INSTRUCTOR' ? d.student : d.instructor
  return [other?.firstName, other?.lastName].filter(Boolean).join(' ') || other?.email || 'Utilisateur'
}
function avatarColor(name: string) {
  const colors = ['bg-brand-100 text-brand-700', 'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700', 'bg-purple-100 text-purple-700', 'bg-pink-100 text-pink-700', 'bg-indigo-100 text-indigo-700']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}
function isRead(m: any) {
  return m.status === 'read' || m.senderId === user?.id
}

// Emoji picker state
const showEmojiPicker = ref(false)
const emojiTab = ref<'emoji' | 'sticker' | 'gif'>('emoji')

const emojis = [
  '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😋','😛','😜','🤪','😝','🤗','🤭','🤫','🤔','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','😮','😳','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','😡','😠','🤬','😈','👿','💀','💩','🤡','👹','👺','👻','👽','👾','🤖','🎃','😺','😸','😹','😻','😼','😽','🙀','😿','😾'
]

const stickers = [
  { id: 's1', url: 'https://media.giphy.com/media/l0HlOvGA35a6I0PCs/giphy.gif', label: 'Cœur' },
  { id: 's2', url: 'https://media.giphy.com/media/3o7abKhOdp6SnJdLTS/giphy.gif', label: 'Pouce' },
  { id: 's3', url: 'https://media.giphy.com/media/xT9IgzoKnwFNfIS78M/giphy.gif', label: 'Rire' },
  { id: 's4', url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', label: 'Applaudir' },
  { id: 's5', url: 'https://media.giphy.com/media/26tOZ42P701gdEm3e/giphy.gif', label: 'Feu' },
  { id: 's6', url: 'https://media.giphy.com/media/l0Ex4JcRdmYmGMgKg/giphy.gif', label: 'Félicitations' },
]

async function loadGifs() {
  try {
    const res = await fetch('https://api.giphy.com/v1/gifs/trending?api_key=dc6zaTOxFJmzC&limit=12&rating=g')
    const data = await res.json()
    return data.data.map((g: any) => ({ id: g.id, url: g.images.fixed_height.url, label: g.title || 'GIF' }))
  } catch {
    return []
  }
}
const gifs = ref<any[]>([])
const gifsLoaded = ref(false)
async function fetchGifs() {
  if (gifsLoaded.value) return
  gifs.value = await loadGifs()
  gifsLoaded.value = true
}

async function createDiscussion() {
  creating.value = true
  try {
    await $fetch('/api/discussions', { method: 'POST', body: { ...createForm } })
    showCreate.value = false
    Object.assign(createForm, { courseId: '', subject: '' })
    await refreshDiscussions()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Erreur.')
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#f0f2f5]">
    <div class="flex h-screen lg:flex">
      <!-- Sidebar conversations (desktop uniquement) -->
      <aside class="hidden lg:flex lg:w-96 flex-col border-r border-gray-200 bg-white">
        <!-- En-tête -->
        <div class="px-4 py-3 border-b border-gray-200 bg-white">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-700 to-brand-800 flex items-center justify-center font-bold text-white text-lg shadow-md shadow-brand/25">
              A
            </div>
            <div>
              <h2 class="text-sm font-bold text-slate-900 leading-tight">Messages</h2>
              <p class="text-[10px] text-brand-600 font-medium uppercase tracking-wider">AST-Academy</p>
            </div>
          </div>
        </div>

        <!-- Recherche -->
        <div class="px-3 py-2 border-b border-gray-100 bg-gray-50">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Rechercher une conversation…"
              class="w-full pl-9 pr-3 py-1.5 rounded-lg text-sm border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
            />
          </div>
        </div>

        <!-- Liste des conversations -->
        <div class="flex-1 overflow-y-auto p-2">
          <div v-if="pending" class="p-4 text-center text-gray-400 text-sm">Chargement des conversations…</div>
          <div v-else-if="!discussions.length" class="p-6 text-center">
            <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <p class="text-sm font-medium text-slate-900">Aucune conversation pour le moment</p>
            <p class="text-xs text-gray-500 mt-0.5">Commencez une discussion avec un formateur ou un apprenant.</p>
          </div>
          <div v-else>
            <button
              v-for="d in discussions"
              :key="d.id"
              type="button"
              class="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 mb-1"
              :class="
                selectedId === d.id
                  ? 'bg-brand-50 border-l-2 border-l-brand-600 shadow-sm'
                  : 'bg-transparent hover:bg-gray-50'
              "
              @click="openDiscussion(d)"
            >
              <!-- Avatar -->
              <div class="w-9 h-9 shrink-0 rounded-lg overflow-hidden border border-gray-200">
                <img v-if="d.image" :src="d.image" :alt="otherName(d)" class="w-full h-full object-cover" />
                <span v-else class="w-full h-full flex items-center justify-center" :class="avatarColor(otherName(d))">
                  {{ otherName(d).charAt(0).toUpperCase() }}
                </span>
              </div>

              <!-- Informations -->
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between mb-0.5">
                  <p class="text-sm font-semibold text-slate-900 truncate">{{ d.subject }}</p>
                  <span v-if="d.unreadCount" class="flex items-center justify-center w-5 h-5 min-w-5 rounded-full bg-brand-600 text-white text-[10px] font-bold">
                    {{ d.unreadCount }}
                  </span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full" :class="d.isOnline ? 'bg-brand-500' : 'bg-gray-400'"></span>
                  <p class="text-[10px] font-medium text-gray-500 truncate">{{ d.isOnline ? 'En ligne' : 'Hors ligne' }}</p>
                </div>
                <p v-if="d.messages?.length" class="text-xs text-gray-400 truncate line-clamp-1 mt-0.5">{{ d.messages[0].content }}</p>
                <p v-else class="text-xs text-gray-400 italic mt-0.5">Aucun message pour le moment</p>
              </div>
            </button>
          </div>
        </div>
      </aside>

      <!-- Zone de conversation principale -->
      <div class="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#f0f2f5]">
        <!-- Header mobile -->
        <header class="lg:hidden flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white z-20">
          <div class="flex items-center gap-3">
            <button type="button" class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition" title="Retour">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div class="w-8 h-8 rounded-lg overflow-hidden border border-gray-200">
              <img v-if="selected?.image" :src="selected.image" :alt="otherName(selected)" class="w-full h-full object-cover" />
              <span v-else class="w-full h-full flex items-center justify-center" :class="avatarColor(otherName(selected))">
                {{ otherName(selected).charAt(0).toUpperCase() }}
              </span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold text-slate-900 leading-tight truncate">{{ selected?.subject || 'Messages' }}</p>
              <div class="flex items-center gap-1 mt-0.5">
                <span class="w-1.5 h-1.5 rounded-full" :class="selected?.isOnline ? 'bg-brand-500' : 'bg-gray-400'"></span>
                <span class="text-[10px] font-medium text-gray-500">{{ selected?.isOnline ? 'En ligne' : 'Hors ligne' }}</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Contenu de la conversation -->
        <main class="flex-1 overflow-y-auto bg-[#f0f2f5] p-4 lg:p-6" :class="{ 'pb-24': !selected }">
          <!-- État vide -->
          <div v-if="!selectedId" class="flex flex-col items-center justify-center h-full text-center">
            <div class="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <h3 class="text-lg font-bold text-slate-900">Sélectionnez une conversation</h3>
            <p class="text-sm text-gray-500 mt-1 max-w-xs mx-auto">Choisissez une discussion dans la liste pour commencer à échanger.</p>
          </div>

          <!-- Chargement -->
          <div v-else-if="loadingThread" class="flex flex-col items-center justify-center h-full">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mb-3"></div>
            <p class="text-sm text-gray-500">Chargement de la conversation…</p>
          </div>

          <!-- Messages -->
          <div v-else-if="selected" class="flex flex-col h-full max-w-none w-full">
            <!-- En-tête conversation fixe -->
            <div class="mb-4 border-b border-gray-200 pb-3 bg-white rounded-xl p-3 shadow-sm sticky top-0 z-20">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-lg overflow-hidden border border-gray-200">
                  <img v-if="selected.image" :src="selected.image" :alt="otherName(selected)" class="w-full h-full object-cover" />
                  <span v-else class="w-full h-full flex items-center justify-center" :class="avatarColor(otherName(selected))">
                    {{ otherName(selected).charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-bold text-slate-900 leading-tight">{{ selected.subject }}</p>
                  <p class="text-xs text-gray-500 uppercase tracking-wider">{{ selected.course?.title }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full" :class="selected.isOnline ? 'bg-brand-500' : 'bg-gray-400'"></span>
                <span class="text-xs text-gray-500">{{ selected.isOnline ? 'En ligne' : 'Hors ligne' }}</span>
              </div>
            </div>

            <!-- Bulles de messages -->
            <div class="flex-1 overflow-y-auto space-y-5 pb-4" ref="messageContainer">
              <div v-for="m in selected.messages" :key="m.id" class="flex" :class="m.senderId === user?.id ? 'justify-end' : 'justify-start'">
                <div
                  class="max-w-[75%] rounded-2xl px-4 py-3 text-sm break-words shadow-sm relative"
                  :class="
                    m.senderId === user?.id
                      ? 'bg-brand-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-900 border border-gray-100 rounded-tl-none'
                  "
                >
                  <p v-if="m.type === 'image'" class="leading-none">
                    <img :src="m.content" class="max-w-[200px] rounded-lg cursor-pointer" />
                  </p>
                  <p v-else class="leading-relaxed">{{ m.content }}</p>
                  <div class="flex items-center gap-1 mt-1.5">
                    <p class="text-[9px] opacity-60">{{ new Date(m.createdAt).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}</p>
                    <span
                      v-if="m.senderId === user?.id"
                      class="inline-flex items-center justify-center w-1.5 h-1.5 rounded-full"
                      :class="isRead(m) ? 'bg-brand-400' : 'bg-gray-400'"
                    ></span>
                    <span
                      v-if="m.senderId === user?.id && isRead(m)"
                      class="text-[9px] text-brand-400"
                      title="Lu"
                    >
                      ✓✓
                    </span>
                  </div>
                </div>
              </div>
              <!-- Indicateur de fin -->
              <div v-if="selected.messages.length" class="text-center py-2">
                <span class="text-[9px] text-gray-300 uppercase tracking-wider">Fin de la conversation</span>
              </div>
            </div>

            <!-- Zone de saisie avec emojis, stickers, GIFs -->
            <div class="sticky bottom-0 z-30 bg-[#f0f2f5] pt-3 pb-6 px-4 shadow-inner border-t border-gray-200">
              <div class="max-w-none w-full">
                <!-- Emoji / Sticker / GIF picker -->
                <div v-if="showEmojiPicker" class="mb-2 rounded-xl bg-white p-3 shadow-xl border border-gray-200">
                  <!-- Tabs -->
                  <div class="flex gap-1 mb-2">
                    <button
                      type="button"
                      :class="emojiTab === 'emoji' ? 'text-brand-600 font-semibold border-b-2 border-brand-600' : 'text-gray-500 hover:text-gray-700'"
                      class="px-3 py-1.5 text-sm transition"
                      @click="emojiTab = 'emoji'"
                    >
                      Émojis
                    </button>
                    <button
                      type="button"
                      :class="emojiTab === 'sticker' ? 'text-brand-600 font-semibold border-b-2 border-brand-600' : 'text-gray-500 hover:text-gray-700'"
                      class="px-3 py-1.5 text-sm transition"
                      @click="emojiTab = 'sticker'"
                    >
                      Stickers
                    </button>
                    <button
                      type="button"
                      :class="emojiTab === 'gif' ? 'text-brand-600 font-semibold border-b-2 border-brand-600' : 'text-gray-500 hover:text-gray-700'"
                      class="px-3 py-1.5 text-sm transition"
                      @click="() => { emojiTab = 'gif'; fetchGifs() }"
                    >
                      GIFs
                    </button>
                  </div>

                  <!-- Emojis -->
                  <div v-if="emojiTab === 'emoji'" class="grid grid-cols-8 gap-1">
                    <button
                      v-for="e in emojis"
                      :key="e"
                      type="button"
                      class="w-8 h-8 rounded-lg text-lg flex items-center justify-center hover:bg-gray-100 transition"
                      @click="insertEmoji(e); showEmojiPicker = false"
                    >
                      {{ e }}
                    </button>
                  </div>

                  <!-- Stickers -->
                  <div v-else-if="emojiTab === 'sticker'" class="grid grid-cols-4 gap-2">
                    <button
                      v-for="s in stickers"
                      :key="s.id"
                      type="button"
                      class="aspect-square rounded-lg overflow-hidden border border-gray-100 hover:scale-105 transition"
                      @click="newMessage.value += ` [Sticker: ${s.label}] (${s.url})`; showEmojiPicker = false"
                    >
                      <img :src="s.url" :alt="s.label" class="w-full h-full object-cover" />
                    </button>
                  </div>

                  <!-- GIFs -->
                  <div v-else-if="emojiTab === 'gif'" class="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                    <button
                      v-for="g in gifs"
                      :key="g.id"
                      type="button"
                      class="aspect-square rounded-lg overflow-hidden border border-gray-100 hover:scale-105 transition"
                      @click="newMessage.value += ` [GIF] ${g.url}`; showEmojiPicker = false"
                    >
                      <img :src="g.url" :alt="g.label" class="w-full h-full object-cover" />
                    </button>
                  </div>
                </div>

                <!-- Input zone -->
                <form class="flex gap-2 items-end" @submit.prevent="sendMessage">
                  <div class="relative flex-1">
                    <input
                      v-model="newMessage"
                      type="text"
                      placeholder="Écrire un message…"
                      class="w-full pl-5 pr-16 py-3 rounded-full border border-gray-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      @keyup.enter="sendMessage"
                    />
                    <button
                      type="button"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 transition"
                      title="Pièces jointes"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5zM5 19a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5z" /></svg>
                    </button>
                    <button
                      type="button"
                      class="absolute right-11 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 transition"
                      title="Émojis, stickers, GIFs"
                      @click="showEmojiPicker = !showEmojiPicker"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2c-5.523 0-10.353 3.61-11.723 8.673C.17 11.481.356 12.09.5 12.648c.099.384.457.708.943.773 1.302.174 2.598.446 3.822.807 1.195.354 2.37.797 3.437 1.325.566.28 1.173.631 1.724 1.036 1.059.777 1.973 1.778 2.72 2.954.51.801.765 1.715.765 2.633 0 1.636-1.169 3.058-2.758 3.592-.93.312-1.882.501-2.857.572-1.549.111-3.114.111-4.684-.028-1.97-.175-3.676-.56-5.084-1.26-.993-.495-1.982-1.26-2.793-2.29-.473-.6-.882-1.295-1.176-2.091-.29-.788-.435-1.62-.435-2.498C2.25 7.25 3.312 5.996 4.684 4.996c.741-.538 1.67-.996 2.793-1.26C8.636 3.312 9.923 3 11.5 3c1.636 0 3.058 1.169 3.592 2.758.312.93.501 1.882.572 2.857.111 1.549.111 3.114-.028 4.684-.175 1.97-.56 3.676-1.26 5.084-.495.993-1.26 1.982-2.29 2.793-.6.473-1.295.882-2.091 1.176-.788.29-1.62.435-2.498.435-.878 0-1.71-.145-2.498-.435-.796-.294-1.49-.704-2.091-1.176-.79-.511-1.49-1.276-2.134-2.178C4.466 17.26 3.75 18.123 3.75 19c0 1.636 1.169 3.058 2.758 3.592.93.312 1.882.501 2.857.572 1.549.111 3.114.111 4.684-.028 1.97-.175 3.676-.56 5.084-1.26.993-.495 1.982-1.26 2.793-2.29.473-.6.882-1.295 1.176-2.091.29-.788.435-1.62.435-2.498C12.75 17.25 13.812 15.996 15.184 14.996c.741-.538 1.67-.996 2.793-1.26C19.636 13.312 20.923 13 22.5 13c1.636 0 3.058 1.169 3.592 2.758.312.93.501 1.882.572 2.857.111 1.549.111 3.114-.028 4.684-.175 1.97-.56 3.676-1.26 5.084-.495.993-1.26 1.982-2.29 2.793-.6.473-1.295.882-2.091 1.176-.788.29-1.62.435-2.498.435-.878 0-1.71-.145-2.498-.435-.796-.294-1.49-.704-2.091-1.176-.79-.511-1.49-1.276-2.134-2.178C14.466 15.26 13.75 16.123 13.75 17c0 .878-.145 1.71-.435 2.498-.294.796-.704 1.49-1.176 2.091-.511.6-1.276 1.49-2.178 2.134-1.302.916-2.724 1.514-4.258 1.514s-2.956-.598-4.258-1.514c-.902-.644-1.667-1.533-2.178-2.134-.473-.601-.882-1.295-1.176-2.091-.29-.788-.435-1.62-.435-2.498 0-.877.145-1.71.435-2.498" /></svg>
                    </button>
                    <button
                      type="submit"
                      class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                      :disabled="sending || !newMessage.trim()"
                      title="Envoyer le message"
                    >
                      <svg v-if="!sending" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                      <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l7-3.668z"></path></svg>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Modal créer une discussion -->
    <div v-if="showCreate" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-slate-900">Nouvelle conversation</h2>
          <button type="button" class="text-gray-400 hover:text-gray-600 transition" @click="showCreate = false">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <p class="text-sm text-gray-500 mb-6">Choisissez une formation et démarrez une discussion.</p>
        <form class="space-y-3" @submit.prevent="createDiscussion">
          <div>
            <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Formation</label>
            <select v-model="createForm.courseId" required class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500">
              <option value="">Sélectionner une formation</option>
              <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.title }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Sujet</label>
            <input
              v-model="createForm.subject"
              type="text"
              placeholder="Ex: Question sur le module 1"
              required
              class="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <div class="flex justify-end gap-2 pt-3">
            <button type="button" class="btn-secondary" @click="showCreate = false">Annuler</button>
            <button type="submit" class="btn-primary" :disabled="creating">{{ creating ? 'Création…' : 'Créer la discussion' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-container {
  scroll-behavior: smooth;
}
</style>
