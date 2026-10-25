import { createRouter, createWebHistory } from 'vue-router'
import ListaView from '../views/ListaView.vue'
import ResumoView from '../views/ResumoView.vue'
import TarefaView from '../views/TarefaView.vue'
import NaoEncontradaView from '../views/NaoEncontradaView.vue'

const routes = [
  { path: '/', name: 'lista', component: ListaView },
  { path: '/resumo', name: 'resumo', component: ResumoView },
  // só ids numéricos, o resto cai no 404
  { path: '/tarefa/:id(\\d+)', name: 'tarefa', component: TarefaView, props: true },
  { path: '/:pathMatch(.*)*', name: 'nao-encontrada', component: NaoEncontradaView }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
