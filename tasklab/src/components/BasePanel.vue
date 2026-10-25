<script setup>
defineProps({ titulo: { type: String, default: '' } })
</script>

<template>
  <section class="painel">
    <h2 v-if="titulo">{{ titulo }}</h2>
    <slot />
  </section>
</template>
