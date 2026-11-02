<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })
useHead({ title: 'Utilisateurs - Administration' })

const { data, pending, refresh } = await useFetch('/api/admin/users')
const users = computed(() => data.value?.users || [])
const search = ref('')
const roleFilter = ref('ALL')

const toggling = ref<string | null>(null)
const deleting = ref<string | null>(null)
const showCreate = ref(false)
const creating = ref(false)
const createForm = reactive({ email: '', password: '', firstName: '', lastName: '', role: 'STUDENT' })
const createError = ref('')

const showEdit = ref(false)
const editing = ref(false)
const editTarget = ref<any>(null)
const editForm = reactive({ firstName: '', lastName: '', role: 'STUDENT', isActive: true })
const editError = ref('')

function openEdit(u: any) {
  editTarget.value = u
  Object.assign(editForm, { firstName: u.firstName || '', lastName: u.lastName || '', role: u.role, isActive: u.isActive })
  showEdit.value = true
}

async function saveEdit() {
  if (!editTarget.value) return
  editing.value = true
  editError.value = ''
  try {
    await $fetch(`/api/admin/users/${editTarget.value.id}`, { method: 'PATCH', body: { ...editForm } })
    showEdit.value = false
    await refresh()
  } catch (e: any) {
    editError.value = e?.data?.statusMessage || 'Erreur.'
  } finally {
    editing.value = false
  }
}

async function toggleActive(u: any) {
  toggling.value = u.id
  try {
    await $fetch(`/api/admin/users/${u.id}`, { method: 'PATCH', body: { isActive: !u.isActive } })
    await refresh()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Erreur.')
  } finally {
    toggling.value = null
  }
}

async function deleteUser(u: any) {
  if (!confirm(`Supprimer ${u.email} ?`)) return
  deleting.value = u.id
  try {
    await $fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' })
    await refresh()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Erreur.')
  } finally {
    deleting.value = null
  }
}

async function createUser() {
  creating.value = true
  createError.value = ''
  try {
    await $fetch('/api/admin/users', { method: 'POST', body: { ...createForm } })
    showCreate.value = false
    Object.assign(createForm, { email: '', password: '', firstName: '', lastName: '', role: 'STUDENT' })
    await refresh()
  } catch (e: any) {
    createError.value = e?.data?.statusMessage || 'Erreur.'
  } finally {
    creating.value = false
  }
}

const filtered = computed(() => {
  return users.value.filter(u => {
    const matchSearch = !search.value || 
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.value.toLowerCase())
    const matchRole = roleFilter.value === 'ALL' || u.role === roleFilter.value
    return matchSearch && matchRole
  })
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 pb-10 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-full">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Utilisateurs</h1>
          <p class="text-slate-600">Gérer les comptes et rôles</p>
        </div>
        <NuxtLink to="/admin" class="btn-secondary">← Retour au tableau de bord</NuxtLink>
      </div>

      <div class="card mb-6 p-4 flex flex-wrap gap-4 items-center">
        <input v-model="search" type="search" placeholder="Rechercher par nom ou email..." class="form-input max-w-sm flex-1" />
        <select v-model="roleFilter" class="form-input max-w-xs">
          <option value="ALL">Tous les rôles</option>
          <option value="STUDENT">Étudiant</option>
          <option value="INSTRUCTOR">Formateur</option>
          <option value="ADMIN">Administrateur</option>
        </select>
        <button type="button" class="btn-primary ml-auto" @click="showCreate = true">+ Ajouter</button>
      </div>

      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Utilisateur</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rôle</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Inscriptions</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Créé le</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
              <tr v-for="u in filtered" :key="u.id">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                      <span class="text-brand-700 font-medium">{{ (u.firstName?.[0] || u.email[0]).toUpperCase() }}</span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-slate-900">{{ u.firstName }} {{ u.lastName }}</div>
                      <div class="text-sm text-slate-500">{{ u.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 text-xs font-medium rounded-full" :class="{
                    'bg-blue-100 text-blue-800': u.role === 'ADMIN',
                    'bg-purple-100 text-purple-800': u.role === 'INSTRUCTOR',
                    'bg-gray-100 text-gray-800': u.role === 'STUDENT'
                  }">{{ u.role }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 text-xs font-medium rounded-full" :class="u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    {{ u.isActive ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-slate-900">{{ u._count?.enrollments || 0 }}</td>
                <td class="px-6 py-4 text-sm text-slate-500">{{ new Date(u.createdAt).toLocaleDateString('fr-FR') }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <button type="button" class="text-slate-500 hover:text-brand-700" title="Modifier" @click="openEdit(u)">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button type="button" class="text-slate-500 hover:text-red-600" title="Supprimer" :disabled="deleting === u.id" @click="deleteUser(u)">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>


  <div v-if="showCreate" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <h2 class="text-lg font-bold text-slate-900 mb-4">Nouvel utilisateur</h2>
      <form class="space-y-3" @submit.prevent="createUser">
        <input v-model="createForm.firstName" type="text" placeholder="Prénom" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input v-model="createForm.lastName" type="text" placeholder="Nom" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input v-model="createForm.email" type="email" placeholder="Email" required class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input v-model="createForm.password" type="password" placeholder="Mot de passe" required class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <select v-model="createForm.role" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="STUDENT">Étudiant</option>
          <option value="INSTRUCTOR">Formateur</option>
          <option value="ADMIN">Administrateur</option>
        </select>
        <p v-if="createError" class="text-sm text-red-600">{{ createError }}</p>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn-secondary" @click="showCreate = false">Annuler</button>
          <button type="submit" class="btn-primary" :disabled="creating">{{ creating ? 'Création…' : 'Créer' }}</button>
        </div>
      </form>
    </div>
  </div>

  <div v-if="showEdit" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <h2 class="text-lg font-bold text-slate-900 mb-4">Modifier l'utilisateur</h2>
      <form class="space-y-3" @submit.prevent="saveEdit">
        <input v-model="editForm.firstName" type="text" placeholder="Prénom" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input v-model="editForm.lastName" type="text" placeholder="Nom" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <select v-model="editForm.role" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="STUDENT">Étudiant</option>
          <option value="INSTRUCTOR">Formateur</option>
          <option value="ADMIN">Administrateur</option>
        </select>
        <label class="flex items-center gap-2 text-sm">
          <input v-model="editForm.isActive" type="checkbox" class="h-4 w-4" />
          Actif
        </label>
        <p v-if="editError" class="text-sm text-red-600">{{ editError }}</p>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn-secondary" @click="showEdit = false">Annuler</button>
          <button type="submit" class="btn-primary" :disabled="editing">{{ editing ? 'Enregistrement…' : 'Enregistrer' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

