<script setup>
import { storeToRefs } from 'pinia'
import { useTarefasStore } from '../stores/tarefas'

const { total, totalPendentes, totalConcluidas, percentualConcluido } =
  storeToRefs(useTarefasStore())
</script>

<template>
  <dl class="resumo">
    <div><dt>Total</dt><dd>{{ total }}</dd></div>
    <div><dt>Pendentes</dt><dd>{{ totalPendentes }}</dd></div>
    <div><dt>Concluídas</dt><dd>{{ totalConcluidas }}</dd></div>
    <div><dt>Concluído</dt><dd>{{ percentualConcluido }}%</dd></div>
  </dl>
  <p>
    <RouterLink :to="{ name: 'lista', query: { filtro: 'pendentes' } }">
      Ver só as pendentes
    </RouterLink>
  </p>
</template>
