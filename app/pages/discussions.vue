<script setup lang="ts">
definePageMeta({ middleware: ['auth'], layout: 'default' })
await navigateTo('/messages', { replace: true })
</script>

<template>
  <div />
</template>