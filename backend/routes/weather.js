// routes/weather.js
const express = require('express');
const axios = require('axios');
const router = express.Router();
const { protect } = require('../middleware/auth');

const WEATHER_API_KEY = process.env.WEATHER_API_KEY; // from .env
const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";

// Helper: generate farm advice
function weatherAdvice(weather) {
  let tips = [];

  if (weather.includes("rain")) {
    tips.push("Rain expected. Avoid irrigating today to save water.");
  }
  if (weather.includes("clear")) {
    tips.push("Clear skies. Ensure crops are irrigated sufficiently.");
  }
  if (weather.includes("cloud")) {
    tips.push("Cloudy conditions. Moderate irrigation recommended.");
  }

  return tips.length ? tips : ["Normal conditions. Monitor soil moisture levels."];
}

// GET /api/weather?city=Nairobi
router.get('/', protect, async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ message: "City is required" });

    const response = await axios.get(WEATHER_URL, {
      params: {
        q: city,
        appid: WEATHER_API_KEY,
        units: "metric"
      }
    });

    const data = response.data;
    const weatherMain = data.weather[0].main.toLowerCase();
    const temp = data.main.temp;

    const advice = weatherAdvice(weatherMain);

    res.json({
      success: true,
      location: data.name,
      temperature: `${temp} °C`,
      weather: data.weather[0].description,
      advice
    });
  } catch (err) {
    console.error("Weather error:", err.message);
    res.status(500).json({ message: "Could not fetch weather data" });
  }
});

module.exports = router;
