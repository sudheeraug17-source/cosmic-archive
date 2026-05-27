var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
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
        temperature: 0.85
      }
    });
    const responseText = response.text || "Cosmic signal weak. The Archive remains silent.";
    res.json({ text: responseText });
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    const fallbacks = {
      Sun: "The Sun. A roaring fusion engine held in perfect balance by its own gravity, casting light across SUDHEER\u2019s eternal archive. It is the heart of our celestial ballet.",
      Mercury: "Mercury. A scorched slate of iron and glass, enduring the raw fury of the Sun. It stands as a silent sentinel at the inner boundary of exploration.",
      Venus: "Venus. A greenhouse pressure cooker buried beneath a sulfur-gold haze. Carbon-dioxide skies and acid rains hide a volcanic terrain untouched by time.",
      Earth: "Earth. A fragile sapphire suspended in the deep void. Supported by a magnetosphere shield, it is the home of humanity and the cradle of SUDHEER\u2019s Archive.",
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
      text: selectedFallback + `

*(Telemetry: Cosmic AI operates in direct contingency mode. Local archive protocols intact.)*`
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode...");
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT} / local: http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
