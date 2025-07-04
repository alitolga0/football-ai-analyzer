<template>
  <section class="teams-section">
    <h2>Takımlar</h2>

    <select v-model="selectedLeague" @change="fetchTeams" aria-label="Lig seçin" class="league-select">
      <option disabled value="">Lig Seçin</option>
      <option value="PL">Premier League (PL)</option>
      <option value="BL1">Bundesliga (BL1)</option>
      <option value="SA">Serie A (SA)</option>
      <option value="PD">La Liga (PD)</option>
      <option value="FL1">Ligue 1 (FL1)</option>
    </select>

    <div v-if="loading" class="loading">Yükleniyor...</div>

    <ul v-if="teams.length" class="teams-list" role="list">
      <li v-for="team in teams" :key="team.id" class="team-item" tabindex="0">
        <strong>{{ team.name }}</strong> — {{ team.venue || 'Stadyum bilgisi yok' }}
      </li>
    </ul>

    <p v-if="error" class="error">{{ error }}</p>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const selectedLeague = ref('')
const teams = ref([])
const loading = ref(false)
const error = ref('')

async function fetchTeams() {
  if (!selectedLeague.value) return

  loading.value = true
  error.value = ''
  teams.value = []

  try {
    const res = await axios.get(`http://localhost:3000/teams/${selectedLeague.value}`)
    teams.value = res.data.teams || []
  } catch (e) {
    error.value = e.response?.data?.message || 'Takımlar yüklenirken hata oluştu.'
  } finally {
    loading.value = false
  }
}
</script>
<style scoped>
.teams-section {
  max-width: 700px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #1e293b;
}

.teams-section h2 {
  font-weight: 700;
  font-size: 1.9rem;
  margin-bottom: 1.5rem;
  color: #2563eb;
  text-align: center;
}

.league-select {
  width: 100%;
  padding: 0.6rem 1rem;
  font-size: 1rem;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  cursor: pointer;
  background-color: white;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
.league-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 6px #93c5fd;
}

.loading {
  text-align: center;
  font-weight: 600;
  color: #64748b;
}

.teams-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.team-item {
  background: #e0e7ff;
  margin-bottom: 0.7rem;
  padding: 0.9rem 1.3rem;
  border-radius: 10px;
  font-weight: 600;
  color: #1e293b;
  box-shadow: 0 1px 4px rgba(37, 99, 235, 0.3);
  transition: background-color 0.3s ease;
  cursor: default;
}
.team-item:hover,
.team-item:focus {
  background-color: #2563eb;
  color: white;
  outline: none;
}

.error {
  margin-top: 1rem;
  color: #dc2626;
  font-weight: 700;
  text-align: center;
}


@media (max-width: 600px) {
  .teams-section {
    padding: 0 0.5rem;
  }
}

</style>