import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface OutfitRating {
  overallScore: number;
  styleCategory: string;
  colorCoordination: number;
  fitAndSilhouette: number;
  versatility: number;
  feedback: string;
  suggestions: string[];
  pros: string[];
  cons: string[];
}

export async function rateOutfit(imageBase64: string, mimeType: string, occasion: string = "General"): Promise<OutfitRating> {
  const prompt = `Analyze this outfit for a ${occasion} occasion and provide a detailed rating and feedback. 
  Be honest but constructive. Consider style, color coordination, fit, and overall aesthetic suitability for the ${occasion} context.
  Return the analysis in JSON format.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-exp", // Using flash for speed and vision capabilities
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64.split(",")[1],
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER, description: "Overall rating from 1 to 10" },
          styleCategory: { type: Type.STRING, description: "Style category (e.g., Streetwear, Minimalist, Formal)" },
          colorCoordination: { type: Type.NUMBER, description: "Color coordination score from 1 to 10" },
          fitAndSilhouette: { type: Type.NUMBER, description: "Fit and silhouette score from 1 to 10" },
          versatility: { type: Type.NUMBER, description: "Versatility score from 1 to 10" },
          feedback: { type: Type.STRING, description: "Detailed feedback about the outfit" },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of suggestions to improve the outfit"
          },
          pros: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "What works well in this outfit"
          },
          cons: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "What could be improved"
          },
        },
        required: ["overallScore", "styleCategory", "colorCoordination", "fitAndSilhouette", "versatility", "feedback", "suggestions", "pros", "cons"],
      },
    },
  });

  return JSON.parse(response.text);
}
