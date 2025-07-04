<template>
  <section class="fixtures-section">
    <h2>Fikstür</h2>

    <select v-model="selectedLeague" @change="fetchFixtures" aria-label="Lig seçin" class="league-select">
      <option disabled value="">Lig Seçin</option>
      <option value="PL">Premier League (PL)</option>
      <option value="BL1">Bundesliga (BL1)</option>
      <option value="SA">Serie A (SA)</option>
      <option value="PD">La Liga (PD)</option>
      <option value="FL1">Ligue 1 (FL1)</option>
    </select>

    <div v-if="loading" class="loading">Yükleniyor...</div>

    <ul v-if="fixtures.length" class="fixtures-list" role="list">
      <li v-for="fixture in fixtures" :key="fixture.id" class="fixture-item" tabindex="0">
        <div class="fixture-date">{{ formatDate(fixture.utcDate) }}</div>
        <div class="fixture-teams">
          <span class="team home">{{ fixture.homeTeam.name }}</span>
          <span class="vs">vs</span>
          <span class="team away">{{ fixture.awayTeam.name }}</span>
        </div>
        <div class="fixture-score" v-if="fixture.score.fullTime.home !== null">
          {{ fixture.score.fullTime.home }} - {{ fixture.score.fullTime.away }}
        </div>
        <div v-else class="fixture-not-played">Henüz oynanmadı</div>
      </li>
    </ul>

    <p v-if="error" class="error">{{ error }}</p>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const selectedLeague = ref('')
const fixtures = ref([])
const loading = ref(false)
const error = ref('')

async function fetchFixtures() {
  if (!selectedLeague.value) return

  loading.value = true
  error.value = ''
  fixtures.value = []

  try {
    const res = await axios.get(`http://localhost:3000/fixtures/${selectedLeague.value}`)
    fixtures.value = res.data.matches || []
  } catch (e) {
    error.value = e.response?.data?.message || 'Fikstür yüklenirken hata oluştu.'
  } finally {
    loading.value = false
  }
}

function formatDate(dateString) {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  return new Date(dateString).toLocaleString('tr-TR', options)
}
</script>
<style scoped>
.fixtures-section {
  max-width: 700px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.fixtures-section h2 {
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
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  background-color: white;
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

.fixtures-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.fixture-item {
  background: #e0e7ff;
  margin-bottom: 1rem;
  padding: 1rem 1.3rem;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(37, 99, 235, 0.3);
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  color: #1e293b;
  cursor: default;
  transition: background-color 0.3s ease;
}
.fixture-item:hover,
.fixture-item:focus {
  background-color: #2563eb;
  color: white;
  outline: none;
}

.fixture-date {
  font-weight: 700;
  font-size: 0.9rem;
  color: #3b82f6;
}

.fixture-teams {
  font-weight: 600;
  font-size: 1.1rem;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.team {
  flex: 1;
  text-align: center;
}

.team.home {
  font-weight: 700;
}

.vs {
  font-weight: 400;
  color: #6b7280;
  flex-shrink: 0;
}

.fixture-score {
  font-weight: 700;
  font-size: 1.2rem;
  text-align: center;
  margin-top: 0.2rem;
}

.fixture-not-played {
  font-style: italic;
  font-size: 0.95rem;
  color: #6b7280;
  text-align: center;
}

.error {
  margin-top: 1rem;
  color: #dc2626;
  font-weight: 700;
  text-align: center;
}


@media (max-width: 600px) {
  .fixtures-section {
    padding: 0 0.5rem;
  }
}

</style>