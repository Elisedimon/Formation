<script setup lang="ts">
useHead({ title: 'Contact – AST-Academy' })

const config = useRuntimeConfig()
const whatsappNumber = computed(() => String(config.public.whatsappNumber || '').replace(/\D/g, ''))
const wa = computed(() => `https://wa.me/${whatsappNumber.value}?text=${encodeURIComponent('Bonjour AST-Academy, je souhaite en savoir plus sur vos formations.')}`)

const form = reactive({
  name: '',
  email: '',
  subject: 'Information sur une formation',
  message: ''
})
const submitting = ref(false)
const submitError = ref('')
const submitSuccess = ref('')

async function submitContact() {
  submitError.value = ''
  submitSuccess.value = ''

  if (!form.name || !form.email || !form.subject || !form.message) {
    submitError.value = 'Tous les champs sont requis.'
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    submitError.value = 'Format d’email invalide.'
    return
  }

  if (form.message.length < 10) {
    submitError.value = 'Le message doit contenir au moins 10 caractères.'
    return
  }

  submitting.value = true
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: { ...form }
    })
    submitSuccess.value = 'Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.'
    Object.assign(form, { name: '', email: '', subject: 'Information sur une formation', message: '' })
  } catch (e: any) {
    submitError.value = e?.data?.statusMessage || 'Erreur lors de l’envoi du message.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="pb-20 bg-slate-50 min-h-screen">
    <div class="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-4">
          <span class="w-2 h-2 rounded-full bg-brand-500" />
          Support & Contact
        </div>
        <h1 class="text-4xl sm:text-5xl font-extrabold text-slate-950 mb-4 tracking-tight">
          Une question ? <span class="text-brand-600">Contactez-nous</span>
        </h1>
        <p class="text-lg text-slate-600 max-w-2xl mx-auto">
          Besoin d’aide pour choisir une formation, une question sur le paiement FedaPay ou un renseignement sur nos certificats ? Nous vous répondons rapidement.
        </p>
      </div>

      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16">
        <!-- Formulaire de contact -->
        <div class="space-y-6">
          <div class="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm">
            <h2 class="text-2xl font-bold text-slate-950 mb-2">Envoyez-nous un message</h2>
            <p class="text-slate-600 mb-6">Remplissez le formulaire ci-dessous, nous vous recontacterons par email.</p>

            <form @submit.prevent="submitContact" class="space-y-5">
              <div class="grid md:grid-cols-2 gap-5">
                <div class="space-y-2">
                  <label class="form-label">Nom et prénom</label>
                  <input
                    v-model="form.name"
                    type="text"
                    required
                    placeholder="Ex. Koffi Mensah"
                    class="form-input"
                  />
                </div>
                <div class="space-y-2">
                  <label class="form-label">Email</label>
                  <input
                    v-model="form.email"
                    type="email"
                    required
                    placeholder="exemple@email.com"
                    class="form-input"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <label class="form-label">Sujet</label>
                <select v-model="form.subject" class="form-input">
                  <option>Information sur une formation</option>
                  <option>Paiement FedaPay</option>
                  <option>Certificat de formation</option>
                  <option>Support technique</option>
                  <option>Partenariat</option>
                  <option>Autre</option>
                </select>
              </div>

              <div class="space-y-2">
                <label class="form-label">Votre message</label>
                <textarea
                  v-model="form.message"
                  rows="5"
                  required
                  placeholder="Décrivez votre demande…"
                  class="form-input"
                ></textarea>
              </div>

              <p v-if="submitError" class="text-sm text-red-700 bg-red-50 p-3 rounded-xl">{{ submitError }}</p>
              <p v-if="submitSuccess" class="text-sm text-brand-700 bg-brand-50 p-3 rounded-xl">{{ submitSuccess }}</p>

              <button
                type="submit"
                :disabled="submitting"
                class="w-full btn-primary py-4 text-lg font-bold transition-all"
              >
                {{ submitting ? 'Envoi en cours…' : 'Envoyer le message' }}
              </button>
            </form>
          </div>
        </div>

        <!-- Informations de contact -->
        <div class="space-y-6">
          <div class="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm">
            <h2 class="text-2xl font-bold text-slate-950 mb-2">Autres moyens de nous joindre</h2>
            <p class="text-slate-600 mb-6">Vous préférez nous contacter directement ? Voici nos canaux :</p>

            <div class="space-y-4">
              <a
                v-if="whatsappNumber"
                :href="wa"
                target="_blank"
                rel="noopener"
                class="flex items-center gap-4 p-4 rounded-2xl border border-brand-100 bg-brand-50 hover:bg-brand-100 hover:border-brand-200 transition-all"
              >
                <div class="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <p class="font-bold text-slate-900">WhatsApp</p>
                  <p class="text-sm text-slate-500">+{{ whatsappNumber }}</p>
                </div>
              </a>

              <div class="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 flex-shrink-0">
                <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22-2.22L8 4z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3a2 2 0 012-2h18a2 2 0 012 2v18a2 2 0 01-2 2H5a2 2 0 01-2-2V3z" />
                  </svg>
                </div>
                <div>
                  <p class="font-bold text-slate-900">Email</p>
                  <p class="text-sm text-slate-500">contact@ast-academy.bj</p>
                </div>
              </div>

              <div class="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 flex-shrink-0">
                <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p class="font-bold text-slate-900">Adresse</p>
                  <p class="text-sm text-slate-500">Cotonou, Bénin – Quartier Haie Vive</p>
                </div>
              </div>
            </div>

            <div class="mt-8 rounded-xl bg-slate-950 p-6 text-white">
              <h3 class="text-lg font-bold mb-2">Horaires d’ouverture</h3>
              <ul class="space-y-2 text-sm text-slate-300">
                <li class="flex justify-between"><span>Lundi – Vendredi</span><span>08h00 – 18h00</span></li>
                <li class="flex justify-between"><span>Samedi</span><span>09h00 – 13h00</span></li>
                <li class="flex justify-between"><span>Dimanche</span><span>Fermé</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.form-label {
  @apply block text-sm font-medium text-slate-700 mb-1;
}
.form-input {
  @apply w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-all;
}
</style>
