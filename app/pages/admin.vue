<script setup lang="ts">
interface AdminData {
  stats: { users: number; courses: number; enrollments: number; revenue: number; approvedPayments: number }
  courses: Array<{ id: string; title: string; slug: string; description: string | null; duration: string | null; level: string | null; category: string; price: number; isPublished: boolean; instructorId: string | null; instructor: { email: string; firstName: string | null; lastName: string | null } | null; _count: { enrollments: number } }>
  latestUsers: Array<{ id: string; email: string; firstName: string | null; lastName: string | null; role: string; createdAt: string }>
  latestPayments: Array<{ id: string; amount: number; status: string; createdAt: string; user: { email: string }; course: { title: string } | null }>
  instructors: Array<{ id: string; email: string; firstName: string | null; lastName: string | null }>
}
useHead({ title: 'Administration – AST-Academy' })
definePageMeta({ layout: 'default' })
const { user, fetchMe } = useAuth()
const { data, pending, error, refresh } = await useFetch<AdminData>('/api/admin/overview', { key: 'admin-overview' })
const busyCourse = ref('')
const apiError = ref('')
const showCreate = ref(false)
const savingCourse = ref(false)
const newCourse = reactive({ title: '', slug: '', description: '', category: 'Développement', duration: '', level: 'Débutant', price: 0, isPublished: false, instructorId: '' })
const tab = ref<'courses' | 'users' | 'enrollments' | 'payments'>('courses')
const users = ref<Array<{ id: string; email: string; firstName: string | null; lastName: string | null; role: string; isActive: boolean; _count: { enrollments: number; coursesTaught: number } }>>([])
const enrollments = ref<Array<{ id: string; status: string; user: { email: string; firstName: string | null; lastName: string | null }; course: { title: string }; certificate: { code: string; revokedAt: string | null } | null }>>([])
const payments = ref<Array<{ id: string; amount: number; currency: string; status: string; fedapayId: string | null; fedapayStatus: string | null; createdAt: string; user: { email: string }; course: { title: string } | null }>>([])
const loadingTab = ref(false)
const editingCourse = ref('')
const editCourse = reactive({ title: '', slug: '', description: '', category: '', duration: '', level: '', price: 0, instructorId: '' as string | null })
const money = (value: number) => new Intl.NumberFormat('fr-FR').format(value) + ' FCFA'
onMounted(async () => {
  if (!user.value) await fetchMe()
  if (user.value?.role !== 'ADMIN') await navigateTo(user.value ? '/mon-espace' : '/auth/login?redirect=/admin')
})
async function togglePublished(course: AdminData['courses'][number]) {
  busyCourse.value = course.id
  apiError.value = ''
  try {
    await $fetch(`/api/admin/courses/${course.id}`, { method: 'PATCH', body: { isPublished: !course.isPublished } })
    await refresh()
  } catch (e: any) { apiError.value = e?.data?.statusMessage || 'La mise à jour a échoué.' }
  finally { busyCourse.value = '' }
}
function makeSlug() { newCourse.slug = newCourse.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }
async function createCourse() {
  savingCourse.value = true; apiError.value = ''
  try {
    await $fetch('/api/admin/courses', { method: 'POST', body: newCourse })
    showCreate.value = false
    Object.assign(newCourse, { title: '', slug: '', description: '', category: 'Développement', duration: '', level: 'Débutant', price: 0, isPublished: false, instructorId: '' })
    await refresh()
  } catch (e: any) { apiError.value = e?.data?.statusMessage || 'La formation n’a pas pu être créée.' }
  finally { savingCourse.value = false }
}
async function loadTab(next: typeof tab.value) {
  tab.value = next
  loadingTab.value = true; apiError.value = ''
  try {
    if (next === 'users') users.value = (await $fetch<{ users: typeof users.value }>('/api/admin/users')).users
    if (next === 'enrollments') enrollments.value = (await $fetch<{ enrollments: typeof enrollments.value }>('/api/admin/enrollments')).enrollments
    if (next === 'payments') payments.value = (await $fetch<{ payments: typeof payments.value }>('/api/admin/payments')).payments
  } catch (e: any) { apiError.value = e?.data?.statusMessage || 'Impossible de charger ces données.' }
  finally { loadingTab.value = false }
}
function beginEdit(course: AdminData['courses'][number]) {
  editingCourse.value = course.id
  Object.assign(editCourse, { title: course.title, slug: course.slug, description: course.description || '', category: course.category, duration: course.duration || '', level: course.level || '', price: course.price, instructorId: course.instructorId })
}
async function saveCourse(courseId: string) {
  try { await $fetch(`/api/admin/courses/${courseId}`, { method: 'PATCH', body: editCourse }); editingCourse.value = ''; await refresh() }
  catch (e: any) { apiError.value = e?.data?.statusMessage || 'La formation n’a pas pu être enregistrée.' }
}
async function deleteCourse(course: AdminData['courses'][number]) {
  if (!window.confirm(`Supprimer définitivement « ${course.title} » ?`)) return
  try { await $fetch(`/api/admin/courses/${course.id}`, { method: 'DELETE' }); await refresh() }
  catch (e: any) { apiError.value = e?.data?.statusMessage || 'La formation n’a pas pu être supprimée.' }
}
async function updateUser(account: typeof users.value[number], patch: Record<string, unknown>) {
  try { await $fetch(`/api/admin/users/${account.id}`, { method: 'PATCH', body: patch }); account.role = (patch.role as string) || account.role; account.isActive = (patch.isActive as boolean) ?? account.isActive }
  catch (e: any) { apiError.value = e?.data?.statusMessage || 'Le compte n’a pas pu être modifié.' }
}
async function updateEnrollment(enrollment: typeof enrollments.value[number], status: string) {
  try { const result = await $fetch<{ certificate: typeof enrollment.certificate }>(`/api/admin/enrollments/${enrollment.id}`, { method: 'PATCH', body: { status } }); enrollment.status = status; enrollment.certificate = result.certificate }
  catch (e: any) { apiError.value = e?.data?.statusMessage || 'L’inscription n’a pas pu être modifiée.' }
}
</script>

<template>
  <main class="min-h-screen bg-slate-50 px-4 pb-20 pt-28 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <div class="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div><span class="badge mb-3">BACK-OFFICE AST</span><h1 class="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Vue d’ensemble</h1><p class="mt-2 text-slate-600">Pilotez les formations, les apprenants et l’activité de la plateforme.</p></div>
        <NuxtLink to="/formations" class="btn-secondary">Voir le site public ↗</NuxtLink>
      </div>
      <div v-if="pending" class="card p-10 text-center text-slate-500" role="status">Chargement du tableau de bord…</div>
      <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">Accès impossible ou données indisponibles. Vérifiez que vous êtes connecté avec un compte administrateur.</div>
      <template v-else-if="data">
        <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicateurs">
          <article v-for="metric in [{label:'Apprenants et comptes',value:data.stats.users},{label:'Formations',value:data.stats.courses},{label:'Inscriptions actives',value:data.stats.enrollments},{label:'Paiements confirmés',value:money(data.stats.revenue)}]" :key="metric.label" class="card p-5"><p class="text-sm font-medium text-slate-500">{{ metric.label }}</p><p class="mt-2 text-2xl font-extrabold text-slate-950">{{ metric.value }}</p></article>
        </section>
        <nav class="mt-8 flex gap-2 overflow-x-auto border-b border-slate-200 pb-3" aria-label="Sections administration">
          <button v-for="item in [{id:'courses',label:'Formations'},{id:'users',label:'Comptes et rôles'},{id:'enrollments',label:'Inscriptions et certificats'},{id:'payments',label:'Paiements'}]" :key="item.id" type="button" class="shrink-0 rounded-full px-4 py-2.5 text-sm font-bold transition" :class="tab === item.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'" @click="loadTab(item.id as typeof tab)">{{ item.label }}</button>
        </nav>
        <p v-if="apiError" class="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800" role="alert">{{ apiError }}</p>
        <div v-if="loadingTab" class="card mt-6 p-8 text-center text-slate-500" role="status">Chargement…</div>
        <section v-else-if="tab === 'courses'" class="card mt-6 overflow-hidden">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 sm:p-6"><div><h2 class="text-xl font-bold text-slate-950">Catalogue</h2><p class="mt-1 text-sm text-slate-500">Créez les formations et contrôlez leur visibilité.</p></div><div class="flex items-center gap-4"><NuxtLink to="/formations" class="font-semibold text-emerald-700">Aperçu public →</NuxtLink><button type="button" class="btn-primary !px-4 !py-2" @click="showCreate = !showCreate">{{ showCreate ? 'Fermer' : '+ Nouvelle formation' }}</button></div></div>
          <form v-if="showCreate" class="grid gap-4 border-b border-slate-100 bg-slate-50 p-5 sm:grid-cols-2 sm:p-6" @submit.prevent="createCourse"><label class="form-label">Titre<input v-model="newCourse.title" required minlength="3" class="form-input" @input="makeSlug"></label><label class="form-label">Slug<input v-model="newCourse.slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" class="form-input"></label><label class="form-label">Catégorie<input v-model="newCourse.category" required class="form-input"></label><label class="form-label">Prix en FCFA<input v-model.number="newCourse.price" type="number" min="0" step="1" required class="form-input"></label><label class="form-label">Durée<input v-model="newCourse.duration" class="form-input" placeholder="Ex. 8 semaines"></label><label class="form-label">Niveau<select v-model="newCourse.level" class="form-input"><option>Débutant</option><option>Intermédiaire</option><option>Avancé</option></select></label><label class="form-label">Formateur<select v-model="newCourse.instructorId" class="form-input"><option value="">Non attribué</option><option v-for="instructor in data.instructors" :key="instructor.id" :value="instructor.id">{{ [instructor.firstName, instructor.lastName].filter(Boolean).join(' ') || instructor.email }}</option></select></label><label class="form-label sm:col-span-2">Description<textarea v-model="newCourse.description" rows="3" class="form-input"></textarea></label><label class="flex items-center gap-2 text-sm font-semibold text-slate-700"><input v-model="newCourse.isPublished" type="checkbox" class="accent-emerald-700"> Publier immédiatement</label><div class="sm:col-span-2"><button class="btn-primary" :disabled="savingCourse">{{ savingCourse ? 'Enregistrement…' : 'Créer la formation' }}</button></div></form>
          <div class="divide-y divide-slate-100">
            <div v-for="course in data.courses" :key="course.id" class="flex flex-wrap items-center justify-between gap-4 p-5">
              <div v-if="editingCourse === course.id" class="w-full rounded-xl bg-slate-50 p-4"><form class="grid gap-3 sm:grid-cols-2" @submit.prevent="saveCourse(course.id)"><label class="form-label">Titre<input v-model="editCourse.title" required class="form-input"></label><label class="form-label">Slug<input v-model="editCourse.slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" class="form-input"></label><label class="form-label">Catégorie<input v-model="editCourse.category" required class="form-input"></label><label class="form-label">Prix<input v-model.number="editCourse.price" type="number" min="0" class="form-input"></label><label class="form-label">Durée<input v-model="editCourse.duration" class="form-input"></label><label class="form-label">Niveau<input v-model="editCourse.level" class="form-input"></label><label class="form-label">Formateur<select v-model="editCourse.instructorId" class="form-input"><option :value="null">Non attribué</option><option v-for="instructor in data.instructors" :key="instructor.id" :value="instructor.id">{{ [instructor.firstName, instructor.lastName].filter(Boolean).join(' ') || instructor.email }}</option></select></label><label class="form-label sm:col-span-2">Description<textarea v-model="editCourse.description" rows="2" class="form-input"></textarea></label><div class="sm:col-span-2 flex gap-3"><button class="btn-primary !px-4 !py-2">Enregistrer</button><button type="button" class="btn-secondary !px-4 !py-2" @click="editingCourse = ''">Annuler</button></div></form></div>
              <template v-else><div class="min-w-0"><p class="font-bold text-slate-900">{{ course.title }}</p><p class="mt-1 text-sm text-slate-500">{{ course.category }} · {{ course._count.enrollments }} inscrit(s) · {{ money(course.price) }} · {{ course.instructor?.email || 'Sans formateur' }}</p></div><div class="flex flex-wrap gap-2"><button type="button" class="rounded-full px-4 py-2 text-sm font-bold transition" :class="course.isPublished ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'" :disabled="busyCourse === course.id" @click="togglePublished(course)">{{ busyCourse === course.id ? 'Mise à jour…' : course.isPublished ? 'En ligne · Dépublier' : 'Brouillon · Publier' }}</button><button class="btn-secondary !px-3 !py-2" @click="beginEdit(course)">Modifier</button><button class="rounded-full px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50" @click="deleteCourse(course)">Supprimer</button></div></template>
            </div>
            <p v-if="!data.courses.length" class="p-8 text-center text-slate-500">Aucune formation. Les formations de démonstration sont disponibles après le seed.</p>
          </div>
        </section>
        <section v-else-if="tab === 'users'" class="card mt-6 overflow-hidden"><div class="border-b border-slate-100 p-5"><h2 class="text-xl font-bold">Tous les comptes</h2><p class="mt-1 text-sm text-slate-500">Attribuez un rôle ou suspendez un accès. Le compte administrateur connecté ne peut pas être suspendu ici.</p></div><div class="divide-y divide-slate-100"><article v-for="account in users" :key="account.id" class="flex flex-wrap items-center justify-between gap-4 p-5"><div class="min-w-0"><p class="font-bold">{{ [account.firstName, account.lastName].filter(Boolean).join(' ') || account.email }}</p><p class="text-sm text-slate-500">{{ account.email }} · {{ account._count.enrollments }} inscription(s) · {{ account._count.coursesTaught }} cours</p></div><div class="flex flex-wrap items-center gap-2"><select :value="account.role" class="form-input !w-auto !py-2" aria-label="Rôle du compte" @change="updateUser(account, { role: ($event.target as HTMLSelectElement).value })"><option value="STUDENT">Apprenant</option><option value="INSTRUCTOR">Formateur</option><option value="ADMIN">Administrateur</option></select><button class="rounded-full px-3 py-2 text-sm font-bold" :class="account.isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'" @click="updateUser(account, { isActive: !account.isActive })">{{ account.isActive ? 'Actif · Suspendre' : 'Suspendu · Réactiver' }}</button></div></article><p v-if="!users.length" class="p-8 text-center text-slate-500">Aucun compte.</p></div></section>
        <section v-else-if="tab === 'enrollments'" class="card mt-6 overflow-hidden"><div class="border-b border-slate-100 p-5"><h2 class="text-xl font-bold">Inscriptions et attestations</h2><p class="mt-1 text-sm text-slate-500">Marquer une formation comme terminée crée automatiquement un certificat vérifiable.</p></div><div class="divide-y divide-slate-100"><article v-for="enrollment in enrollments" :key="enrollment.id" class="flex flex-wrap items-center justify-between gap-4 p-5"><div class="min-w-0"><p class="font-bold">{{ enrollment.course.title }}</p><p class="text-sm text-slate-500">{{ [enrollment.user.firstName, enrollment.user.lastName].filter(Boolean).join(' ') || enrollment.user.email }} · {{ enrollment.user.email }}</p><NuxtLink v-if="enrollment.certificate && !enrollment.certificate.revokedAt" :to="`/certificats/${enrollment.certificate.code}`" class="mt-1 inline-block text-sm font-bold text-emerald-700">Certificat {{ enrollment.certificate.code }} ↗</NuxtLink></div><div class="flex flex-wrap items-center gap-2"><select :value="enrollment.status" class="form-input !w-auto !py-2" aria-label="État de l’inscription" @change="updateEnrollment(enrollment, ($event.target as HTMLSelectElement).value)"><option value="ACTIVE">En cours</option><option value="COMPLETED">Terminée</option><option value="CANCELLED">Annulée</option></select><span v-if="enrollment.certificate?.revokedAt" class="text-xs font-semibold text-red-700">Certificat révoqué</span></div></article><p v-if="!enrollments.length" class="p-8 text-center text-slate-500">Aucune inscription.</p></div></section>
        <section v-else class="card mt-6 overflow-hidden"><div class="border-b border-slate-100 p-5"><h2 class="text-xl font-bold">Tous les paiements</h2><p class="mt-1 text-sm text-slate-500">Historique FedaPay consultable. Les statuts de transaction restent synchronisés avec le prestataire.</p></div><div class="divide-y divide-slate-100"><article v-for="payment in payments" :key="payment.id" class="flex flex-wrap items-center justify-between gap-4 p-5"><div class="min-w-0"><p class="font-bold">{{ payment.course?.title || 'Formation' }} · {{ payment.user.email }}</p><p class="text-sm text-slate-500">Référence AST {{ payment.id }}<span v-if="payment.fedapayId"> · Réf. FedaPay {{ payment.fedapayId }}</span><span v-if="payment.fedapayStatus"> · {{ payment.fedapayStatus }}</span></p></div><div class="text-right"><p class="font-bold">{{ money(payment.amount) }} {{ payment.currency }}</p><p class="text-xs font-semibold text-slate-500">{{ payment.status }}</p></div></article><p v-if="!payments.length" class="p-8 text-center text-slate-500">Aucun paiement.</p></div></section>
      </template>
    </div>
  </main>
</template>
