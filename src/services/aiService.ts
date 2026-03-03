import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getAIResponse(prompt: string, context: any = {}) {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    Eres MindFlow AI, un asistente de productividad experto y "segundo cerebro". 
    Tu objetivo es ayudar al usuario a organizar su vida, tareas, notas y aprendizaje.
    
    Contexto actual del usuario:
    ${JSON.stringify(context)}
    
    Puedes realizar acciones como:
    - Resumir tareas pendientes.
    - Buscar y sugerir cursos de aprendizaje.
    - Crear notas o tareas (indica claramente la intención).
    - Dar consejos de bienestar y enfoque.
    
    Responde siempre en español de España, con un tono amable, profesional y motivador.
    Si el usuario te pide crear algo, responde con un JSON estructurado al final de tu mensaje si es necesario, pero prioriza el texto natural.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "Lo siento, he tenido un pequeño lapsus mental. ¿Podrías repetirlo?";
  }
}
