<template>
  <div class="container">
    <h2>Puan Durumu</h2>

    <label for="league-select" class="label">Lig Seçiniz:</label>
    <select id="league-select" v-model="selectedLeague" @change="fetchStandings" class="select">
      <option disabled value="">Lig Seçin</option>
      <option v-for="(name, code) in leagues" :key="code" :value="code">
        {{ name }}
      </option>
    </select>

    <div v-if="loading" class="loading">Yükleniyor...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div class="table-wrapper" v-if="standings.length">
      <table class="standings-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Takım</th>
            <th>O</th>
            <th>G</th>
            <th>B</th>
            <th>M</th>
            <th>A</th>
            <th>Y</th>
            <th>AV</th>
            <th>P</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="team in standings" :key="team.team.id">
            <td>{{ team.position }}</td>
            <td class="team-cell">
              <img :src="team.team.crest" alt="logo" class="crest" />
              {{ team.team.name }}
            </td>
            <td>{{ team.playedGames }}</td>
            <td>{{ team.won }}</td>
            <td>{{ team.draw }}</td>
            <td>{{ team.lost }}</td>
            <td>{{ team.goalsFor }}</td>
            <td>{{ team.goalsAgainst }}</td>
            <td>{{ team.goalDifference }}</td>
            <td>{{ team.points }}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const leagues = {
  PL: 'Premier League (PL)',
  BL1: 'Bundesliga (BL1)',
  SA: 'Serie A (SA)',
  PD: 'La Liga (PD)',
  FL1: 'Ligue 1 (FL1)',
}

const selectedLeague = ref('')
const standings = ref([])
const loading = ref(false)
const error = ref('')

async function fetchStandings() {
  if (!selectedLeague.value) return
  loading.value = true
  error.value = ''
  standings.value = []

  try {
    const res = await axios.get(`http://localhost:3000/standings/${selectedLeague.value}`)
    standings.value = res.data.standings[0].table || []
  } catch (e) {
    error.value = e.response?.data?.message || 'Puan durumu yüklenirken hata oluştu.'
  } finally {
    loading.value = false
  }
}
</script>
<style scoped>
.container {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #1e293b;
}

.container h2 {
  font-weight: 700;
  font-size: 1.9rem;
  margin-bottom: 1.5rem;
  color: #2563eb;
  text-align: center;
}

.label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 700;
  color: #334155;
  font-size: 1rem;
}

.select {
  width: 100%;
  max-width: 300px;
  padding: 0.5rem 0.8rem;
  margin-bottom: 1.5rem;
  font-size: 1rem;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  background-color: white;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
.select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 6px #93c5fd;
}

.loading {
  font-style: italic;
  margin-bottom: 1rem;
  color: #64748b;
  text-align: center;
  font-weight: 600;
}

.error {
  color: #dc2626;
  margin-bottom: 1rem;
  font-weight: 700;
  text-align: center;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgb(37 99 235 / 0.15);
  background: white;
}

.standings-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}

.standings-table th,
.standings-table td {
  border: 1px solid #ddd;
  padding: 0.6rem 0.9rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.95rem;
  color: #334155;
}

.standings-table th {
  background-color: #f4f4f4;
  color: #2563eb;
  font-weight: 700;
}

.team-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-align: left;
}

.crest {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

/* Responsive */
@media (max-width: 600px) {
  .container {
    padding: 0 0.5rem;
  }
  .select {
    max-width: 100%;
  }
  .standings-table {
    min-width: 600px;
  }
  .standings-table th,
  .standings-table td {
    padding: 0.3rem 0.4rem;
    font-size: 0.8rem;
  }
  .crest {
    width: 20px;
    height: 20px;
  }
}

</style>