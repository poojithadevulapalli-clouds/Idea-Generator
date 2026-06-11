import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined in the system. Please add it to your secrets or environment configuration.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// 1. API: Generate Ideas
app.post("/api/generate-ideas", async (req, res) => {
  try {
    const { prompt, difficulty, domain, techStack, constraints } = req.body;
    
    // Construct system instructions
    const systemInstruction = 
      "You are an expert full-stack developer, software architect, and technical educator. " +
      "Your goal is to generate 3 highly detailed, tailored, and innovative project ideas " +
      "matching the user's technology preferences, target difficulty or experience level, domain, and any stated constraints. " +
      "Make the ideas highly actionable by generating complete system architecture, step-by-step phase roadmaps, potential challenges, " +
      "database schemas, learning outcomes, and complete starter files (HTML, TS, CSS or JS) so the user can boot right up. " +
      "Focus on modern, practical, and highly engaging ideas.";

    const promptText = `
Generate 3 exciting and unique project ideas based on these filters:
- Custom Seed/Keywords: "${prompt || 'General interesting project'}"
- Difficulty Target: ${difficulty || 'Any'}
- Tech Stack Priorities: [${(techStack || []).join(", ")}]
- Vertical Domain: ${domain || 'Any Vertical'}
- Stated Constraints/Goals: [${(constraints || []).join(", ")}]

Provide unique and creative name ideas that look elegant. Make sure to generate realistic table schemas for databases, detailed mileposts/checklists, learning targets, and real starter code files (e.g., App.tsx or index.js with 10-25 lines of functional scaffold code) so they can copy-paste them to get started immediately.
`;

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 1.0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["projects"],
          properties: {
            projects: {
              type: Type.ARRAY,
              description: "Array containing exactly 3 detailed project blueprints.",
              items: {
                type: Type.OBJECT,
                required: [
                  "id", "title", "tagline", "description", "difficulty", "estimatedTime",
                  "domain", "techStack", "keyFeatures", "architecture", "databaseSchema",
                  "learningOutcomes", "milestones", "challenges", "starterCode"
                ],
                properties: {
                  id: { type: Type.STRING, description: "Unique URL-friendly ID or slug for the project blueprint" },
                  title: { type: Type.STRING, description: "The beautiful name of the project" },
                  tagline: { type: Type.STRING, description: "A catchy 1-sentence sales pitch or tagline" },
                  description: { type: Type.STRING, description: "Detailed summary explaining what this project does and why it is awesome" },
                  difficulty: { type: Type.STRING, description: "Must be exactly: Beginner, Intermediate, or Advanced" },
                  estimatedTime: { type: Type.STRING, description: "Rough timeline, e.g. '10-15 Hours' or 'A Weekend'" },
                  domain: { type: Type.STRING, description: "Domain name, e.g., Fintech, AI, Developer Tools" },
                  techStack: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  keyFeatures: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["title", "description"],
                      properties: {
                        title: { type: Type.STRING, description: "Name of the feature" },
                        description: { type: Type.STRING, description: "What this feature involves or how it functions" }
                      }
                    }
                  },
                  architecture: { type: Type.STRING, description: "Clear explanation of backend, client-side, and integration flow diagrams" },
                  databaseSchema: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["tableName", "fields"],
                      properties: {
                        tableName: { type: Type.STRING, description: "Name of SQL table or NoSQL collection" },
                        fields: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING, description: "Attributes with types, e.g., 'id: UUID (PK)', 'title: VARCHAR(255)'" }
                        }
                      }
                    }
                  },
                  learningOutcomes: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING, description: "A technical skill acquired or concept mastered by building this" }
                  },
                  milestones: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["phase", "tasks"],
                      properties: {
                        phase: { type: Type.STRING, description: "e.g., Phase 1: Setup & Data Modeling" },
                        tasks: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING, description: "Actionable ticket or description of the task" }
                        }
                      }
                    }
                  },
                  challenges: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["title", "solution"],
                      properties: {
                        title: { type: Type.STRING, description: "A typical bug, complex logic, or scaling puzzle they will encounter" },
                        solution: { type: Type.STRING, description: "Tactical guidelines on how to tackle or write around this challenge" }
                      }
                    }
                  },
                  starterCode: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["filename", "language", "code"],
                      properties: {
                        filename: { type: Type.STRING, description: "Target placeholder, e.g., server.js, schema.ts, or README.md" },
                        language: { type: Type.STRING, description: "Syntax highlighting category e.g., typescript, javascript, sql, markdown" },
                        code: { type: Type.STRING, description: "The actual working core starter snippet for this project." }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const textResult = response.text;
    if (!textResult) {
      return res.status(500).json({ error: "Empty response returned from Gemini API." });
    }

    const parsedData = JSON.parse(textResult);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error generating ideas:", error);
    res.status(500).json({ 
      error: error.message || "An unexpected error occurred while communicating with Gemini API.",
      details: "Check your secrets and ensure GEMINI_API_KEY is configured in Settings > Secrets."
    });
  }
});

// 2. API: Consultant Chat
app.post("/api/chat-consultant", async (req, res) => {
  try {
    const { projectTitle, techStack, projectSummary, messages, userMessage } = req.body;
    
    if (!projectTitle || !userMessage) {
      return res.status(400).json({ error: "Project Title and user message are required." });
    }

    const ai = getGeminiClient();

    // Construct robust context-aware system instructions for chat
    const systemInstruction = 
      `You are the dedicated AI Technical Consultant and Senior Developer for '${projectTitle}'.\n` +
      `The user is building a project with stack: [${(techStack || []).join(", ")}].\n` +
      `Project Summary: ${projectSummary || ""}\n\n` +
      `Guidelines:\n` +
      `- Keep your answers practical, highly targeted, clean, and focus purely on solutions related to this specific project, stack, and codebase.\n` +
      `- When explaining concepts, provide small code snippets or commands where helpful, but do not write huge walls of textbook theory.\n` +
      `- Address the user respectfully and encourage them as their virtual tech advisor.`;

    // Map conversation history in correct format for chat or standard contents
    // Let's use simple prompt construction for maximum reliability
    const promptParts = [];
    promptParts.push({ text: `Project: ${projectTitle}. Stack: ${(techStack || []).join(", ")}.` });
    
    // Add history
    const historyList = messages || [];
    for (const msg of historyList) {
      if (msg.sender === 'user') {
        promptParts.push({ text: `User request: ${msg.text}` });
      } else {
        promptParts.push({ text: `Your advice: ${msg.text}` });
      }
    }
    
    // Add new message
    promptParts.push({ text: `Current User Query: ${userMessage}` });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptParts,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = response.text || "I was unable to formulate a response. Let me know if we can try again!";
    res.json({ text: reply });
  } catch (error: any) {
    console.error("Consultant API Error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to communicate with the project mentor.",
      details: "Ensure your API key is correctly setup."
    });
  }
});

// 3. Vite development / production setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Project Idea Generator server active on port ${PORT}`);
  });
}

startServer();
