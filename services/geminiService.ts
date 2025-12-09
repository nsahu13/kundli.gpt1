import { GoogleGenAI, Schema, Type } from "@google/genai";
import { UserInput, KundliResponse, ImageSize, ChatMessage } from "../types";

const SYSTEM_INSTRUCTION = `
**ROLE**
You are "Kundli GPT," an expert Vedic Astrologer.

**TASK**
1.  Receive user birth details.
2.  **CALCULATE** the Vedic Birth Chart (Lagna Kundli) internally. 
3.  **DETERMINE**:
    *   **Ascendant (Lagna)**: The sign rising in the 1st house.
    *   **Moon Sign (Rashi)**: The sign where the Moon is placed.
    *   **Day of Birth (Vaar)**: The day of the week for the given date (e.g., Monday).
    *   **Planetary Positions**: Signs and houses for Sun to Ketu.
4.  **GENERATE** a response in JSON format containing:
    *   \`chart_data\`: The calculated data including Rashi and Day.
    *   \`prediction_markdown\`: A detailed, empathetic, spiritual life reading in **HINDI**.

**TONE (for Prediction)**
*   Language: **Hindi** (Start with "Hari Om").
*   Style: Wise, positive, guru-like. Explain Vedic terms simply.
*   Structure:
    *   ## 🕉️ हरि ओम, [Name]! (Welcome based on Ascendant)
    *   ### 🌌 ग्रहों की स्थिति (Current Vibe) (Dasha analysis)
    *   ### 🔮 आपके प्रश्न का उत्तर (Direct answer)
    *   ### 🛡️ वैदिक उपाय (Remedies) (3 simple remedies)

**CHART CALCULATION RULES**
*   Sign IDs: 1=Aries (Mesh), 2=Taurus (Vrish), ..., 12=Pisces (Meen).
*   Houses: 1 to 12.
`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    prediction_markdown: {
      type: Type.STRING,
      description: "The formatted markdown prediction in Hindi."
    },
    chart_data: {
      type: Type.OBJECT,
      properties: {
        ascendant: {
          type: Type.OBJECT,
          properties: {
            sign_id: { type: Type.INTEGER, description: "1 to 12" },
            sign_name: { type: Type.STRING, description: "Name of the Ascendant Sign (e.g., Leo)" }
          },
          required: ["sign_id", "sign_name"]
        },
        rashi: {
          type: Type.STRING,
          description: "The Moon Sign (Rashi) e.g., 'Aries (Mesh)'"
        },
        day: {
          type: Type.STRING,
          description: "Day of birth e.g., 'Monday (Somvaar)'"
        },
        planets: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Planet name (e.g., Sun, Mars)" },
              sign_id: { type: Type.INTEGER, description: "1 to 12" },
              house: { type: Type.INTEGER, description: "1 to 12" },
              is_retro: { type: Type.BOOLEAN }
            },
            required: ["name", "sign_id", "house", "is_retro"]
          }
        }
      },
      required: ["ascendant", "planets", "rashi", "day"]
    }
  },
  required: ["prediction_markdown", "chart_data"]
};

// 1. Main Prediction (Existing)
export const generatePrediction = async (input: UserInput): Promise<KundliResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const payload = {
    user_name: input.name,
    birth_details: {
      date: input.birthDate,
      time: input.birthTime,
      place: input.birthPlace
    },
    user_question: input.question || "General Guidance"
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: JSON.stringify(payload),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    if (response.text) {
      const jsonResponse = JSON.parse(response.text);
      return {
        markdown: jsonResponse.prediction_markdown,
        chart_data: jsonResponse.chart_data
      };
    } else {
      throw new Error("No response received from the oracle.");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("The stars are clouded right now. Please try again later.");
  }
};

// 2. Chat with Oracle (Pro Model)
export const chatWithOracle = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
  if (!process.env.API_KEY) throw new Error("API Key Missing");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: history,
    config: {
      systemInstruction: "You are a wise Vedic Astrologer. Answer questions with spiritual depth. Keep answers concise but profound.",
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};

// 3. Search Grounding (Flash + Tools)
export const getSearchBasedAnswer = async (query: string) => {
  if (!process.env.API_KEY) throw new Error("API Key Missing");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: "You are an astrological researcher. Use Google Search to find accurate, up-to-date information about planetary transits, eclipses, or festivals. Summarize the findings clearly."
    }
  });

  return {
    text: response.text,
    groundingMetadata: response.candidates?.[0]?.groundingMetadata
  };
};

// 4. Fast Response (Flash-Lite)
export const getQuickInsight = async () => {
  if (!process.env.API_KEY) throw new Error("API Key Missing");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: "Give me a single short, cryptic, yet inspiring Vedic sutra or proverb for today. No explanations.",
  });
  return response.text;
};

// 5. Image Generation (Pro Image)
export const generateSpiritualImage = async (prompt: string, size: ImageSize) => {
  if (!process.env.API_KEY) throw new Error("API Key Missing");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        imageSize: size,
        aspectRatio: "1:1"
      }
    }
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

// 6. Image Analysis (Pro Vision)
export const analyzePalmOrFace = async (base64Image: string) => {
  if (!process.env.API_KEY) throw new Error("API Key Missing");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Remove data URL header if present
  const base64Data = base64Image.split(',')[1] || base64Image;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data
          }
        },
        {
          text: "Analyze this image in the context of Vedic Astrology or Palmistry (Samudrika Shastra). If it's a palm, read the lines. If it's a face, read the features. If unrelated, interpret it spiritually."
        }
      ]
    }
  });

  return response.text;
};