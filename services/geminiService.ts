
import { GoogleGenAI, GenerateContentResponse, Chat, Type } from "@google/genai";
import { SearchResult, GroundingSource, YieldDataPoint, EconomicStats } from "../types";

// Note: API_KEY is managed via process.env.API_KEY or the selection dialog for image pro
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

/**
 * Extracts grounding sources from a GenerateContentResponse for consistent display.
 */
const extractSources = (response: GenerateContentResponse): GroundingSource[] => {
  return response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map((chunk: any) => ({
      title: chunk.web?.title || "Source",
      uri: chunk.web?.uri || "",
    }))
    .filter((s: GroundingSource) => s.uri !== "") || [];
};

export const getLatestEconomicData = async (): Promise<SearchResult> => {
  const ai = getAI();
  const today = new Date().toLocaleDateString('en-GB');
  const prompt = `Today is ${today}. Search for the LATEST key economic indicators for Sri Lanka from the Central Bank of Sri Lanka (CBSL).
  Extract exactly:
  1. Current Exchange Rate (LKR vs USD Selling Rate).
  2. Current CCPI Inflation (Year-on-Year percentage).
  3. Standing Deposit Facility Rate (SDFR).
  4. Standing Lending Facility Rate (SLFR).
  5. Determine if inflation is trending up, down, or neutral.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });

    const sources = extractSources(response);

    // Using gemini-flash-lite-latest for efficient JSON extraction
    const extractionResponse = await ai.models.generateContent({
      model: "gemini-flash-lite-latest", 
      contents: `Extract numerical values from this report into JSON: "${response.text}". Fields: usdRate, inflation, sdfr, slfr, inflationTrend (up/down/neutral).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            usdRate: { type: Type.STRING },
            inflation: { type: Type.STRING },
            sdfr: { type: Type.STRING },
            slfr: { type: Type.STRING },
            inflationTrend: { type: Type.STRING },
          },
          required: ["usdRate", "inflation", "sdfr", "slfr", "inflationTrend"]
        }
      }
    });

    return {
      text: response.text || "",
      sources,
      stats: JSON.parse(extractionResponse.text)
    };
  } catch (error) {
    console.error("Eco data error:", error);
    return { text: "Error fetching snapshot.", sources: [] };
  }
};

/**
 * Fetches the latest Treasury Bill and Bond auction notices.
 * Implementation for missing export used in App.tsx
 */
export const getAuctionNotices = async (): Promise<SearchResult> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Find the LATEST Treasury Bill and Treasury Bond auction notices from the Central Bank of Sri Lanka. Include dates, types and amounts.",
      config: { tools: [{ googleSearch: {} }] },
    });
    
    const sources = extractSources(response);
    return { text: response.text || "", sources };
  } catch (e) {
    console.error("Auction notice error:", e);
    return { text: "Auction notices unavailable.", sources: [] };
  }
};

/**
 * Fetches the most recent Treasury Bill auction results and yields.
 * Implementation for missing export used in App.tsx
 */
export const getLatestYields = async (): Promise<SearchResult> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Find the most recent Treasury Bill auction results for Sri Lanka, specifically the weighted average yields for 91-day, 182-day, and 364-day bills.",
      config: { tools: [{ googleSearch: {} }] },
    });
    
    const sources = extractSources(response);
    return { text: response.text || "", sources };
  } catch (e) {
    console.error("Yield data error:", e);
    return { text: "Yield data unavailable.", sources: [] };
  }
};

export const getYieldTrendData = async (): Promise<YieldDataPoint[]> => {
  const ai = getAI();
  try {
    const searchResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find Sri Lankan Treasury Bill secondary market yields (91-day, 182-day, 364-day) for the last 5 weeks.`,
      config: { tools: [{ googleSearch: {} }] },
    });

    // Using gemini-flash-lite-latest for data extraction
    const extraction = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: `Extract weekly yield data from: "${searchResponse.text}" into a JSON array of objects with date (DD MMM), 91-Day, 182-Day, 364-Day (numbers).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              "91-Day": { type: Type.NUMBER },
              "182-Day": { type: Type.NUMBER },
              "364-Day": { type: Type.NUMBER },
            },
            required: ["date", "91-Day", "182-Day", "364-Day"]
          }
        }
      }
    });

    return JSON.parse(extraction.text);
  } catch (e) {
    console.error("Yield trend error:", e);
    return [];
  }
};

export const getLatestNews = async (): Promise<SearchResult> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: "Latest 5 economic news headlines for Sri Lanka from the last 7 days.",
      config: { tools: [{ googleSearch: {} }] },
    });
    const sources = extractSources(response);
    return { text: response.text || "", sources };
  } catch (e) {
    console.error("News error:", e);
    return { text: "News unavailable.", sources: [] };
  }
};

export const getWeeklyFridayReport = async (): Promise<SearchResult> => {
  const ai = getAI();
  const prompt = `Act as a fixed income analyst and write a comprehensive weekly report on the Sri Lankan debt market. Focus on Treasury Bill and Bond performance, interest rate movements, and macroeconomic outlook.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 32768 } // Use max thinking budget for complex reports
      },
    });
    const sources = extractSources(response);
    return { text: response.text || "", sources };
  } catch (e) {
    console.error("Weekly report error:", e);
    return { text: "Report generation failed.", sources: [] };
  }
};

export const createChatSession = (): Chat => {
  const ai = getAI();
  return ai.chats.create({
    model: 'gemini-3-pro-preview', 
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: `You are the LankaDebt AI Specialist. Provide expert analysis on Sri Lankan debt markets. Always mention your sources when possible.`,
    },
  });
};

export const generateMarketImage = async (prompt: string, size: "1K" | "2K" | "4K"): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: `A high-quality, professional financial visualization: ${prompt}. Cinematic lighting, detailed infographics, 8k resolution style.` }] },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: size
      }
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

export const analyzeInvestment = async (query: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text || "";
  } catch (e) {
    console.error("Analysis error:", e);
    return "Analysis failed.";
  }
};
