
import { GoogleGenAI } from "@google/genai";
import { AIConfig } from "../types";

// Default Configurations
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const DEFAULT_SILICONFLOW_MODEL = 'deepseek-ai/DeepSeek-V3';
const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';

// Get Config from LocalStorage
const getAIConfig = (): AIConfig => {
  const stored = localStorage.getItem('nihongo_ai_config');
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Fallback for legacy key or default
  const legacyKey = localStorage.getItem('nihongo_gemini_key') || process.env.API_KEY || '';
  return {
    provider: 'gemini',
    apiKey: legacyKey,
    model: DEFAULT_GEMINI_MODEL
  };
};

// --- Provider: Google Gemini ---
const callGemini = async (config: AIConfig, systemPrompt: string, userMessage: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: config.apiKey });
  const modelId = config.model || DEFAULT_GEMINI_MODEL;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Request: ${userMessage}` }] }],
    });
    return response.text || '';
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Gemini Request Failed");
  }
};

// --- Provider: SiliconFlow (OpenAI Compatible) ---
const callSiliconFlow = async (config: AIConfig, systemPrompt: string, userMessage: string): Promise<string> => {
  const modelId = config.model || DEFAULT_SILICONFLOW_MODEL;

  try {
    const response = await fetch(SILICONFLOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        stream: false,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error: any) {
    console.error("SiliconFlow API Error:", error);
    throw new Error(error.message || "SiliconFlow Request Failed");
  }
};

// --- Shared AI Helper ---
const callAI = async (systemPrompt: string, userPrompt: string): Promise<string> => {
    const config = getAIConfig();
    if (!config.apiKey) throw new Error("请先配置 API Key");
    
    if (config.provider === 'siliconflow') {
        return callSiliconFlow(config, systemPrompt, userPrompt);
    } else {
        return callGemini(config, systemPrompt, userPrompt);
    }
};

// --- Main Service Functions ---

export const askGeminiTutor = async (
  question: string,
  context: string = ''
): Promise<string> => {
  const systemPrompt = `
    You are a friendly and patient Japanese language tutor named "Sensei AI". 
    The user is a native Chinese speaker learning Japanese (specifically Minna no Nihongo).
    
    Current Context:
    The user is studying vocabulary and grammar.
    Additional Context (Exercise appearing on screen): "${context}"

    Please explain the answer in Chinese (Simplified). 
    Keep explanations concise, encouraging, and easy to understand. 
    If the user makes a mistake, explain *why* it is wrong based on the grammar rules.
  `;

  try {
    return await callAI(systemPrompt, question);
  } catch (error: any) {
    return `连接 AI 服务失败: ${error.message}。请检查设置。`;
  }
};

export const generateWordExamples = async (word: string, meaning: string): Promise<string> => {
  const prompt = `
    作为日语初学者（N5/N4水平）的老师，请用日语单词 "${word}" (含义: ${meaning}) 造 2 个简单易懂的例句。
    
    要求：
    1. 例句要简短，适合《大家的日语》初级水平。
    2. 必须包含中文翻译。
    3. 格式简洁，不要有多余的废话。
    
    输出格式示例：
    1. 日本へ行きます。
    (我去日本。)
    2. ...
  `;

  try {
    return await callAI("You are a Japanese teacher.", prompt);
  } catch (error) {
      return '生成例句失败，请检查 API Key 或网络设置。';
  }
};

// --- Speaking Exam AI Functions ---

export const startRolePlay = async (topic: string): Promise<string> => {
    const system = `
      You are a Japanese language teacher at Hokkaido University.
      We are doing a roleplay practice for an oral exam.
      Topic: ${topic}.
      
      Your goal: Start the conversation with a question or greeting related to the topic.
      Constraint: Speak ONLY in Japanese. Keep vocabulary simple (N4/N5 level).
      Output: Only the opening sentence.
    `;
    try {
        return await callAI(system, "Start the conversation.");
    } catch (e) {
        return "すみません、ちょっと待ちます。（AI 连接失败）";
    }
};

export const continueRolePlay = async (history: {role: string, text: string}[], userText: string): Promise<string> => {
    const system = `
      You are a Japanese language teacher at Hokkaido University conducting an oral exam roleplay.
      Level: JLPT N4/N5 (Beginner).
      Constraint: Speak ONLY in Japanese. Keep responses concise and simple.
      Goal: Respond to the student naturally. Correct them politely if they make a huge mistake, otherwise keep the flow.
    `;
    
    // Build context string from history
    const conversation = history.map(h => `${h.role === 'model' ? 'Teacher' : 'Student'}: ${h.text}`).join('\n');
    const prompt = `${conversation}\nStudent: ${userText}\nTeacher: (Respond in Japanese)`;
    
    try {
        return await callAI(system, prompt);
    } catch (e) {
        return "（AI 响应失败）";
    }
};

export const generateSpeakingQuestion = async (): Promise<{q: string, a: string}> => {
    const system = `You are a Japanese oral exam proctor.`;
    const prompt = `
      Generate ONE random interview question for a Hokkaido University exchange student (N4/N5 level). 
      Topics: Sapporo life, hobbies, weekend plans, university studies, food.
      
      Return ONLY a valid JSON object with no markdown formatting:
      { "q": "Question in Japanese", "a": "Simple sample answer in Japanese" }
    `;
    
    try {
        const text = await callAI(system, prompt);
        const cleanText = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (e) {
        console.error(e);
        return { q: '札幌の冬は どうですか。', a: 'とても 寒いです。でも、雪が きれいです。' }; // Fallback
    }
};

export const evaluateSpeakingAnswer = async (question: string, answer: string): Promise<string> => {
    const system = `You are a helpful Japanese tutor.`;
    const prompt = `
      Context: JLPT N4/N5 Speaking Practice.
      Question: ${question}
      Student Answer: ${answer}
      
      Please evaluate this answer.
      1. Is it grammatically correct?
      2. Is it natural?
      3. If there are mistakes, provide the corrected Japanese sentence.
      
      Reply in Chinese (Simplified). Keep it concise and encouraging.
    `;
    
    try {
        return await callAI(system, prompt);
    } catch (e) {
        return "无法评估，请检查网络连接。";
    }
};
