<template>
  <div class="app-container">


    <aside :class="['sidebar', sidebarOpen ? 'open' : '']" role="navigation" aria-label="Ana menü">
      <nav class="menu">
        <button
          v-for="item in menuItems"
          :key="item.name"
          @click="selectComponent(item.component)"
          :class="['menu-btn', currentComponent === item.component ? 'active' : '']"
          :aria-current="currentComponent === item.component ? 'page' : false"
        >
          {{ item.name }}
        </button>
      </nav>
    </aside>


    <div
      v-if="sidebarOpen"
      class="overlay"
      @click="toggleSidebar"
      aria-hidden="true"
    ></div>


    <div class="main-content">


      <header class="topbar" role="banner">
        <button
          class="menu-toggle"
          @click="toggleSidebar"
          :aria-label="sidebarOpen ? 'Menüyü kapat' : 'Menüyü aç'"
          :aria-expanded="sidebarOpen"
        >☰</button>
        <h2 class="page-title">{{ currentTitle }}</h2>
        <div></div>
      </header>

      <main class="content-area" role="main" tabindex="-1">
        <component :is="currentComponent" />
      </main>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Teams from './components/Teams.vue'
import Fixtures from './components/Fixtures.vue'
import Standings from './components/Standings.vue'
import TeamLastMatches from './components/TeamLastMatches.vue'

const menuItems = [
  { name: 'Takımlar', component: Teams },
  { name: 'Fikstür', component: Fixtures },
  { name: 'Puan Durumu', component: Standings },
  { name: 'Detaylı Analiz', component: TeamLastMatches }
]

const sidebarOpen = ref(false)
const currentComponent = ref(Teams)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function selectComponent(comp) {
  currentComponent.value = comp
  sidebarOpen.value = false
  setTimeout(() => {
    document.querySelector('main[role="main"]')?.focus()
  }, 300)
}

const currentTitle = computed(() => {
  const found = menuItems.find(i => i.component === currentComponent.value)
  return found?.name || ''
})
</script>

<style>

* {
  box-sizing: border-box;
}
body, html, #app {
  margin: 0; padding: 0; height: 100%;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: #f9fafb;
  color: #374151;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.sidebar {
  position: fixed;
  top: 0; left: 0;
  width: 280px;
  height: 100%;
  background: #2c3e50;
  box-shadow: 3px 0 15px rgba(0,0,0,0.1);
  transform: translateX(-100%);
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
  z-index: 1000;
}

.sidebar.open {
  transform: translateX(0);
  box-shadow: 4px 0 20px rgba(0,0,0,0.2);
}

@media (min-width: 768px) {
  .sidebar {
    position: relative;
    transform: translateX(0);
    box-shadow: none;
    border-radius: 0;
  }
}


.menu {
  flex-grow: 1;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
}

.menu-btn {
  background: transparent;
  border: none;
  text-align: left;
  padding: 0.85rem 1.25rem;
  font-size: 1.1rem;
  cursor: pointer;
  border-radius: 10px;
  color: #fff;
  font-weight: 600;
  transition: all 0.3s ease;
  user-select: none;
  box-shadow: inset 0 0 0 0 transparent;
  display: block;
  min-height: 48px; 
}

.menu-btn:hover,
.menu-btn:focus-visible {
  color: #1d4ed8;
  background: #dbeafe;
  outline-offset: 3px;
  outline: 2px solid #2563eb;
}

.menu-btn.active {
  color: white;
  background: #2563eb;
  box-shadow: 0 4px 14px rgb(37 99 235 / 0.4);
}


.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 600;
  backdrop-filter: blur(3px);
}

@media (min-width: 768px) {
  .overlay {
    display: none;
  }
}

.main-content {
  flex-grow: 1;
  margin-left: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  transition: margin-left 0.3s ease;
}

@media (min-width: 768px) {
  .main-content {
    margin-left: 280px;
  }
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 0.75rem 1.25rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  font-weight: 700;
  font-size: 1.2rem;
  color: #1f2937;
  user-select: none;
  position: sticky;
  top: 0;
  z-index: 500;
}

.menu-toggle {
  background: transparent;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  color: #2563eb;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-toggle:hover,
.menu-toggle:focus {
  background-color: #dbeafe;
  outline: none;
}

@media (min-width: 768px) {
  .topbar {
    display: none;
  }
}


.content-area {
  flex-grow: 1;
  padding: 1.5rem;
  overflow-y: auto;
  background: #f9fafb;
  min-height: 0;
  scroll-behavior: smooth;
  color: #1e293b;
  -webkit-overflow-scrolling: touch; 
}

@media (min-width: 768px) {
  .content-area {
    padding: 2rem;
  }
}


@media (max-width: 767px) {
  html, body {
    overflow-x: hidden;
    width: 100%;
  }
}
</style>