<template>
  <div class="container">
    <h1>Lig ve Takım Seçimi</h1>

    <label for="league-select">Lig seçin:</label>
    <select id="league-select" v-model="selectedLeague" @change="fetchTeams">
      <option disabled value="">Lütfen lig seçin</option>
      <option v-for="league in leagues" :key="league.id" :value="league.code">
        {{ league.name }}
      </option>
    </select>

    <div v-if="loadingTeams" class="loading">Takımlar yükleniyor...</div>

    <div v-if="teams.length > 0" class="teams-section">
      <h3>Takımları seçin (En fazla 2):</h3>
      <div class="teams-list">
        <div v-for="team in teams" :key="team.id" class="team-item">
          <input
            type="checkbox"
            :id="team.id"
            :value="team"
            v-model="selectedTeams"
            :disabled="selectedTeams.length >= 2 && !selectedTeams.includes(team)"
          />
          <label :for="team.id">{{ team.name }}</label>
        </div>
      </div>

      <p class="selected-teams">
        Seçilen Takımlar: <strong>{{ selectedTeams.map(t => t.name).join(", ") }}</strong>
      </p>

      <button @click="doSomething" :disabled="selectedTeams.length !== 2" class="btn-analyze">
        Analiz İste
      </button>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h2>Gemini AI Analiz</h2>
        <div class="modal-text" v-html="analysisContent"></div>
        <button class="btn-close" @click="closeModal">Kapat</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      leagues: [],
      selectedLeague: "",
      teams: [],
      selectedTeams: [],
      loadingTeams: false,
      showModal: false,
      analysisContent: "",
    };
  },
  mounted() {
    this.fetchLeagues();
  },
  methods: {
    async fetchLeagues() {
      try {
        const res = await fetch("http://localhost:3000/leagues");
        const data = await res.json();
        this.leagues = data;
      } catch (err) {
        console.error("Ligler yüklenirken hata:", err);
      }
    },
    async fetchTeams() {
      if (!this.selectedLeague) return;
      this.loadingTeams = true;
      this.teams = [];
      this.selectedTeams = [];
      try {
        const res = await fetch(`http://localhost:3000/teams/${this.selectedLeague}`);
        const data = await res.json();
        this.teams = data.teams || [];
      } catch (err) {
        console.error("Takımlar yüklenirken hata:", err);
      } finally {
        this.loadingTeams = false;
      }
    },
    async doSomething() {
      if (this.selectedTeams.length !== 2) return;

      const [teamA, teamB] = this.selectedTeams;

      try {
        const res = await fetch("http://localhost:3000/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `Lütfen ${teamA.name} ile ${teamB.name} arasındaki maç için detaylı analiz yap.`,
          }),
        });

        const data = await res.json();

        if (data.success && data.generatedContent) {
          this.analysisContent = data.generatedContent.replace(/\n/g, "<br>");
        } else {
          this.analysisContent = "<p>Analiz alınamadı.</p>";
        }

        this.showModal = true;
      } catch (error) {
        console.error("Gemini API hatası", error);
        this.analysisContent = "<p>Analiz isteği gönderilirken hata oluştu.</p>";
        this.showModal = true;
      }
    },
    closeModal() {
      this.showModal = false;
      this.analysisContent = "";
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 520px;
  margin: 40px auto;
  padding: 30px 35px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgb(0 0 0 / 0.12);
  transition: box-shadow 0.3s ease;
}

.container:hover {
  box-shadow: 0 15px 35px rgb(0 0 0 / 0.18);
}

h1 {
  margin-bottom: 25px;
  color: #1e293b;
  text-align: center;
  font-weight: 700;
  font-size: 2rem;
  letter-spacing: 1px;
}

label {
  display: block;
  margin-top: 18px;
  margin-bottom: 10px;
  font-weight: 700;
  color: #334155;
  font-size: 1rem;
  user-select: none;
}

select {
  width: 100%;
  padding: 12px 14px;
  font-size: 1rem;
  border-radius: 8px;
  border: 2px solid #cbd5e1;
  background-color: #f9fafb;
  transition: border-color 0.3s ease, background-color 0.3s ease;
  box-shadow: inset 0 2px 5px rgb(0 0 0 / 0.05);
  cursor: pointer;
}

select:focus {
  border-color: #2563eb;
  background-color: #fff;
  outline: none;
  box-shadow: 0 0 6px 2px rgba(37, 99, 235, 0.4);
}

.loading {
  margin-top: 14px;
  font-style: italic;
  color: #64748b;
  text-align: center;
  font-weight: 600;
}

.teams-section {
  margin-top: 30px;
}

.teams-list {
  max-height: 240px;
  overflow-y: auto;
  border: 1.8px solid #e2e8f0;
  padding: 15px 20px;
  border-radius: 10px;
  background: #fefefe;
  box-shadow: 0 4px 10px rgb(0 0 0 / 0.04);
  scrollbar-width: thin;
  scrollbar-color: #2563eb #e2e8f0;
}

.teams-list::-webkit-scrollbar {
  width: 8px;
}

.teams-list::-webkit-scrollbar-track {
  background: #e2e8f0;
  border-radius: 10px;
}

.teams-list::-webkit-scrollbar-thumb {
  background-color: #2563eb;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
}

.team-item {
  margin-bottom: 12px;
  font-size: 1rem;
  color: #334155;
  display: flex;
  align-items: center;
  user-select: none;
}

.team-item input[type="checkbox"] {
  margin-right: 12px;
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #2563eb;
  border-radius: 5px;
  transition: transform 0.15s ease;
}

.team-item input[type="checkbox"]:hover {
  transform: scale(1.1);
}

.selected-teams {
  margin-top: 18px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  user-select: text;
}

.btn-analyze {
  margin-top: 28px;
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 14px 0;
  font-size: 1.15rem;
  font-weight: 700;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
  box-shadow: 0 6px 12px rgb(37 99 235 / 0.5);
}

.btn-analyze:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
  box-shadow: none;
  color: #e2e8f0;
}

.btn-analyze:not(:disabled):hover {
  background-color: #1e40af;
  box-shadow: 0 8px 16px rgb(30 64 175 / 0.65);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(23, 42, 69, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  from {opacity: 0;}
  to {opacity: 1;}
}

.modal-content {
  background: #fefefe;
  max-width: 620px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  border-radius: 14px;
  padding: 30px 35px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
  text-align: left;
  color: #334155;
  position: relative;
  font-size: 1rem;
  line-height: 1.6;
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 22px;
  font-weight: 800;
  color: #2563eb;
  font-size: 1.8rem;
  letter-spacing: 0.8px;
}

.modal-text {
  white-space: pre-wrap;
  font-size: 1rem;
  margin-bottom: 30px;
  color: #475569;
  user-select: text;
}

.btn-close {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 1rem;
  border-radius: 10px;
  cursor: pointer;
  float: right;
  font-weight: 700;
  box-shadow: 0 6px 12px rgb(239 68 68 / 0.7);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.btn-close:hover {
  background-color: #b91c1c;
  box-shadow: 0 8px 16px rgb(185 28 28 / 0.9);
}

</style>