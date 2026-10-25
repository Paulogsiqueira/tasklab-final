<script setup>
defineProps({ tarefa: { type: Object, required: true } })
defineEmits(['alternar', 'remover'])
</script>

<template>
  <li class="item">
    <input
      type="checkbox"
      :id="`t-${tarefa.id}`"
      :checked="tarefa.concluida"
      @change="$emit('alternar', tarefa.id)"
    />
    <label :for="`t-${tarefa.id}`" :class="{ feita: tarefa.concluida }">{{ tarefa.titulo }}</label>
    <RouterLink :to="{ name: 'tarefa', params: { id: tarefa.id } }">Detalhes</RouterLink>
    <button type="button" :aria-label="`Remover ${tarefa.titulo}`" @click="$emit('remover', tarefa.id)">
      Remover
    </button>
  </li>
</template>
