import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const askSommelier = async (question: string): Promise<string> => {
  const client = getClient();
  if (!client) return "Desculpe, o Sommelier não está disponível no momento (API Key ausente).";

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: question,
      config: {
        systemInstruction: "Você é um especialista em queijos (Sommelier de Queijos) amigável e sofisticado. Seu foco principal é Queijo Mussarela. Dê dicas de receitas, vinhos que harmonizam, como conservar e usos culinários. Responda em português do Brasil. Seja conciso e útil.",
        temperature: 0.7,
      }
    });

    return response.text || "Não consegui formular uma resposta sobre queijos agora.";
  } catch (error) {
    console.error("Error talking to Gemini:", error);
    return "Tive um problema ao consultar meu livro de receitas. Tente novamente em breve.";
  }
};
