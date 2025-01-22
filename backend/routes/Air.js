const express = require("express");
const axios = require("axios");

const router = express.Router();

const API_KEY = "54ac3a71b986923a033a0f3ce8b41a8d";
const BASE_URL = "http://api.openweathermap.org/data/2.5/air_pollution";

router.get("/air-pollution", async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ message: "Latitude and longitude are required" });
        }

        const response = await axios.get(BASE_URL, {
            params: {
                lat,
                lon,
                appid: API_KEY
            }
        });

        const pm25 = response.data.list[0].components.pm2_5;
        
        res.json({
            pm25,
            location: {
                lat,
                lon
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching air pollution data" });
    }
});

module.exports = router;