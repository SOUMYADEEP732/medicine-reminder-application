const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/speak", async (req, res) => {
  try {
    const { text } = req.body;

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      {
        text,
        model_id: "eleven_multilingual_v2"
      },
      {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json"
        },
        params: {
          output_format: "mp3_44100_128"
        },
        responseType: "arraybuffer"
      }
    );

    res.set("Content-Type", "audio/mpeg");
    res.send(Buffer.from(response.data));
  } catch (error) {
    console.error("ElevenLabs error:", error.message);
    res.status(500).json({
      message: "Unable to generate voice reminder"
    });
  }
});

module.exports = router;