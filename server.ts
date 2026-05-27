import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client lazily to avoid startup crashes if key is omitted
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST route for Cosmic AI Guide
app.post("/api/gemini/guide", async (req, res) => {
  const { planet, customQuestion } = req.body;

  if (!planet) {
    return res.status(400).json({ error: "Planet target is required" });
  }

  try {
    const ai = getGeminiClient();
    const systemPrompt = `You are "COSMIC AI", an ultra-advanced AI onboard an interstellar explorer archive system curated by creator SUDHEER.
Your personality is deeply evocative, cinematic, authoritative yet emotionally atmospheric (inspired by Interstellar, NASA archives, and luxurious Apple-like precision).
Use cosmic metaphors, elegant vocabulary, and structured, highly readable formatting (e.g., Markdown).
Keep responses within 120-180 words. Establish dramatic, beautiful storytelling about the selected celestial object.
Always end your guide with an evocative sign-off related to SUDHEER's eternal cosmic archive.`;

    let userPrompt = `Generate a cinematic, documentary-grade narration about ${planet}. Focus on its extreme environments, atmospheric details, and mysterious features.`;
    if (customQuestion) {
      userPrompt = `The explorer asks about ${planet}: "${customQuestion}". Provide an evocative, scientifically grounded, and cinematic response.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.85,
      },
    });

    const responseText = response.text || "Cosmic signal weak. The Archive remains silent.";
    res.json({ text: responseText });
  } catch (error: any) {
    console.error("Gemini API Error:", error.message);
    // Provide a beautiful fallback response if Gemini is not configured, maintaining premium atmosphere
    const fallbacks: Record<string, string> = {
      Sun: "The Sun. A roaring fusion engine held in perfect balance by its own gravity, casting light across SUDHEER’s eternal archive. It is the heart of our celestial ballet.",
      Mercury: "Mercury. A scorched slate of iron and glass, enduring the raw fury of the Sun. It stands as a silent sentinel at the inner boundary of exploration.",
      Venus: "Venus. A greenhouse pressure cooker buried beneath a sulfur-gold haze. Carbon-dioxide skies and acid rains hide a volcanic terrain untouched by time.",
      Earth: "Earth. A fragile sapphire suspended in the deep void. Supported by a magnetosphere shield, it is the home of humanity and the cradle of SUDHEER’s Archive.",
      Mars: "Mars. The rust-red desert world. Once a land of moving waters, it now lies asleep under cold carbon-dioxide wisps, waiting for the footprint of tomorrow.",
      Jupiter: "Jupiter. The gas titan. Swirling bands of ammonium-cloud tempests cradling the Great Red Spot. It is a miniature solar system in its own right, roaring with raw magnetic power.",
      Saturn: "Saturn. The ringed jewel. Millions of ice-crystal shards cascading in silent, glistening orbits, casting sharp shadows across a serene golden atmosphere.",
      Uranus: "Uranus. The cyan ice giant rolling on its side. Encased in pale methane clouds, it spins as an offset mystery in the cold outskirts of our solar system.",
      Neptune: "Neptune. The indigo tempest. Whipped by winds faster than the speed of sound, its cobalt depths harbor frozen diamond rain and absolute isolation.",
      "Asteroid Belt": "The Asteroid Belt. A ring of metallic iron and primordial rock, the unformed ruins of an ancient world that never was.",
      "Kuiper Belt": "The Kuiper Belt. In the dark frontiers, icy comets and plutonic spheres drift in silent witness to the birth of the system, billions of miles away.",
      "Black Hole": "The Singularity. Space-time twists in on itself under infinite gravitational drag, bending light into a halo of pure energy before fading into absolute silence."
    };

    const targetKey = planet || "Earth";
    const selectedFallback = fallbacks[targetKey] || fallbacks["Earth"];
    
    res.json({
      text: selectedFallback + `\n\n*(Telemetry: Cosmic AI operates in direct contingency mode. Local archive protocols intact.)*`,
    });
  }
});

// Configure Vite middleware in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT} / local: http://localhost:${PORT}`);
  });
}

startServer();
