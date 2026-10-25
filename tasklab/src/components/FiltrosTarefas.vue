<script setup>
import { useFiltrosUrl } from '../composables/useFiltrosUrl'
import { FILTROS, ROTULOS } from '../utils/filtros'

const { busca, filtro, aplicar } = useFiltrosUrl()

// só mexe na query, não nas tarefas
function limparFiltros() {
  aplicar({ busca: '', filtro: 'todas' })
}
</script>

<template>
  <div class="filtros">
    <form @submit.prevent>
      <label for="busca">Buscar</label>
      <input id="busca" type="search" :value="busca" @input="aplicar({ busca: $event.target.value })" />
      <label for="filtro">Mostrar</label>
      <select id="filtro" :value="filtro" @change="aplicar({ filtro: $event.target.value })">
        <option v-for="f in FILTROS" :key="f" :value="f">{{ ROTULOS[f] }}</option>
      </select>
      <button type="button" @click="limparFiltros">Limpar filtros</button>
    </form>
  </div>
</template>
