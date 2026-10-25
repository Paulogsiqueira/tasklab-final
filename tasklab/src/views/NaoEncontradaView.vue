<script setup>
import BasePanel from '../components/BasePanel.vue'
</script>

<template>
  <BasePanel titulo="Página não encontrada">
    <p>Esse endereço não existe.</p>
    <RouterLink :to="{ name: 'lista' }">Voltar para a lista</RouterLink>
  </BasePanel>
</template>
