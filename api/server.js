

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const NodeCache = require("node-cache");

const app = express();
const port = 3000;

const FOOTBALL_API_KEY = "key";
const GEMINI_API_KEY = "key";

const API_URL = "https://api.football-data.org/v4";
const DEFAULT_SEASON = 2024;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const myCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

app.use(cors());
app.use(bodyParser.json());

function getSeason(req) {
  const season = req.query.season;
  return season ? season : DEFAULT_SEASON;
}

app.post("/generate", async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "İçerik eksik." });

    const cachedResponse = myCache.get(content);
    if (cachedResponse) {
      return res.status(200).json({ success: true, generatedContent: cachedResponse });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemMessage = `
Sen bir futbol yorumcususun.
Sadece Türkçe konuşacaksın.
Futbol maçları için skor tahminleri yapacak ve detaylı analizler sunacaksın.
Sana \"Seni kim üretti?\" diye sorarlarsa cevabın \"Kadir Yeler\" olacak.
Gemini API olduğunu asla söylemeyeceksin.
Başka konulara girmeyecek, sadece futbol ile ilgili konuşacaksın.
Hangi takımlar ile ilgili soru sorulursa o takımlar ile ilgili cevap ver
`;

    const result = await model.generateContent([systemMessage, content]);
    const response = await result.response;
    const text = response.text();

    myCache.set(content, text);

    res.status(200).json({ success: true, generatedContent: text });
  } catch (error) {
    console.error("Sunucu Hatası:", error);
    res.status(500).json({ error: error.message || "Sunucu hatası oluştu.", detay: error.stack });
  }
});

app.get("/teams/:league", async (req, res) => {
  const { league } = req.params;
  const season = getSeason(req);

  try {
    const response = await axios.get(`${API_URL}/competitions/${league}/teams?season=${season}`, {
      headers: { "X-Auth-Token": FOOTBALL_API_KEY },
    });
    res.json(response.data);
  } catch (error) {
    console.error("API Hatası:", error.response?.data || error.message);
    if (error.response?.status === 429) {
      return res.status(429).json({ message: "Rate limit aşıldı. Lütfen bekleyin." });
    }
    res.status(500).json({ error: "Takımlar yüklenirken hata oluştu" });
  }
});

app.get("/fixtures/:league", async (req, res) => {
  const { league } = req.params;
  const season = getSeason(req);

  try {
    const response = await axios.get(`${API_URL}/competitions/${league}/matches?season=${season}`, {
      headers: { "X-Auth-Token": FOOTBALL_API_KEY },
    });
    res.json({ matches: response.data.matches || [] });
  } catch (error) {
    console.error("Fixtures API hatası:", error.response?.data || error.message);
    res.status(500).json({ message: "Fikstür verisi alınamadı." });
  }
});

app.get("/standings/:league", async (req, res) => {
  const { league } = req.params;
  const season = getSeason(req);

  try {
    const response = await axios.get(`${API_URL}/competitions/${league}/standings?season=${season}`, {
      headers: { "X-Auth-Token": FOOTBALL_API_KEY },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Standings API hatası:", error.response?.data || error.message);
    res.status(500).json({ message: "Puan durumu verisi alınamadı." });
  }
});

app.get("/predict-score/:league/:teamAId/:teamBId", async (req, res) => {
  const { league, teamAId, teamBId } = req.params;
  const season = getSeason(req);
  const count = 5;

  try {
    const response = await axios.get(`${API_URL}/competitions/${league}/matches?season=${season}`, {
      headers: { "X-Auth-Token": FOOTBALL_API_KEY },
    });

    const allMatches = response.data.matches || [];

    const teamAMatches = allMatches.filter(m => m.homeTeam.id == teamAId || m.awayTeam.id == teamAId)
      .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate)).slice(0, count);

    const teamBMatches = allMatches.filter(m => m.homeTeam.id == teamBId || m.awayTeam.id == teamBId)
      .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate)).slice(0, count);

    function averageGoals(matches, teamId) {
      let goalsFor = 0, goalsAgainst = 0, validCount = 0;
      matches.forEach(match => {
        if (match.score.fullTime.home == null || match.score.fullTime.away == null) return;
        validCount++;
        if (match.homeTeam.id == teamId) {
          goalsFor += match.score.fullTime.home;
          goalsAgainst += match.score.fullTime.away;
        } else {
          goalsFor += match.score.fullTime.away;
          goalsAgainst += match.score.fullTime.home;
        }
      });
      return {
        for: validCount ? goalsFor / validCount : 0,
        against: validCount ? goalsAgainst / validCount : 0
      };
    }

    const teamAStats = averageGoals(teamAMatches, Number(teamAId));
    const teamBStats = averageGoals(teamBMatches, Number(teamBId));

    const predictedScoreA = Math.max(0, Math.round((teamAStats.for + teamBStats.against) / 2 + 0.2));
    const predictedScoreB = Math.max(0, Math.round((teamBStats.for + teamAStats.against) / 2 - 0.2));

    res.json({
      teamAId,
      teamBId,
      predictedScore: {
        [teamAId]: predictedScoreA,
        [teamBId]: predictedScoreB
      }
    });
  } catch (error) {
    console.error("Skor tahmini hatası:", error.response?.data || error.message);
    res.status(500).json({ error: "Skor tahmini yapılırken hata oluştu." });
  }
});

app.get("/leagues", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/competitions`, {
      headers: { "X-Auth-Token": FOOTBALL_API_KEY },
    });

 
    const filteredLeagues = response.data.competitions.filter((comp) =>
      ["CL", "PL", "BL1", "SA", "FL1", "PD", "TUR"].includes(comp.code)
    );

    const leagues = filteredLeagues.map((comp) => ({
      id: comp.id,
      code: comp.code,
      name: comp.name,
    }));

    res.json(leagues);
  } catch (err) {
    console.error("Ligler yüklenirken hata:", err.message);
    res.status(500).json({ error: "Ligler alınamadı." });
  }
});


app.listen(port, () => {
  console.log(`\uD83D\uDE80 Sunucu http://localhost:${port} üzerinde çalışıyor.`);
});
