<script setup lang="ts">
interface Course {
  id: string | number
  title: string
  category: string
  duration: string
  level: string
  price: number
  image?: string | null
  rating?: number
}

const props = defineProps<{
  course: Course
}>()

const courseImage = computed(() => {
  if (props.course.image) return props.course.image
  const category = String(props.course.category || '').toLowerCase()
  if (category.includes('data')) return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80'
  if (category.includes('cloud')) return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80'
  if (category.includes('design')) return 'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=900&q=80'
  if (category.includes('sécur') || category.includes('secur')) return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=900&q=80'
  if (category.includes('mobile')) return 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9?auto=format&fit=crop&w=900&q=80'
  if (category.includes('développement') || category.includes('developpement')) return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80'
  return null
})

const formatPrice = (price: number) =>
  new Intl.NumberFormat('fr-FR').format(price) + ' FCFA'
</script>

<template>
  <NuxtLink
    :to="`/formations/${course.id}`"
    class="group block card card-hover overflow-hidden h-full flex flex-col min-h-[420px]"
  >
    <div class="aspect-[16/10] bg-gradient-to-br from-ink-100 to-brand-50 relative overflow-hidden">
      <img
        v-if="courseImage"
        :src="courseImage"
        :alt="`Illustration de la formation ${course.title}`"
        class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      >
      <div v-else class="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_75%_20%,rgba(243,107,69,.4),transparent_35%),linear-gradient(135deg,#10192c,#293247)]">
        <div class="absolute -right-8 -top-10 h-44 w-44 rounded-full border border-white/20" />
        <div class="absolute -bottom-16 -left-8 h-52 w-52 rounded-full border border-white/20" />
        <div class="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-2xl font-bold text-white shadow-xl backdrop-blur-sm transition-transform duration-500 group-hover:scale-110">
          {{ course.category?.[0] || 'F' }}
        </div>
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-ink-950/20 to-transparent" />
      <div class="absolute top-3 left-3">
        <span class="badge !bg-white/95 !backdrop-blur-sm shadow-sm">
          {{ course.category }}
        </span>
      </div>
    </div>

    <div class="p-5 flex flex-col justify-between h-full">
      <h3 class="font-semibold text-ink-900 text-lg mb-2 group-hover:text-brand-700 transition-colors duration-300 line-clamp-2">
        {{ course.title }}
      </h3>

      <div class="flex items-center gap-3 text-xs text-ink-500 mb-4">
        <span class="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ course.duration }}
        </span>
        <span class="w-1 h-1 rounded-full bg-ink-300" />
        <span>{{ course.level }}</span>
      </div>

      <div class="flex items-center justify-between">
        <span class="font-bold text-brand-600">{{ formatPrice(course.price) }}</span>
        <span class="text-sm text-ink-400 group-hover:text-brand-600 transition-colors flex items-center gap-1 font-medium">
          Voir
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
