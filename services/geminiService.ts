
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

// --- Main Service Functions ---

export const askGeminiTutor = async (
  question: string,
  context: string = ''
): Promise<string> => {
  const config = getAIConfig();
  
  if (!config.apiKey) {
    return "请先在设置中配置 API Key 才能使用 AI 功能。";
  }

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
    if (config.provider === 'siliconflow') {
      return await callSiliconFlow(config, systemPrompt, question);
    } else {
      return await callGemini(config, systemPrompt, question);
    }
  } catch (error: any) {
    return `连接 AI 服务失败: ${error.message}。请检查设置。`;
  }
};

export const generateWordExamples = async (word: string, meaning: string): Promise<string> => {
  const config = getAIConfig();
  
  if (!config.apiKey) {
    return "请配置 API Key 以生成例句。";
  }

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
    if (config.provider === 'siliconflow') {
      return await callSiliconFlow(config, "You are a Japanese teacher.", prompt);
    } else {
      return await callGemini(config, "You are a Japanese teacher.", prompt);
    }
  } catch (error) {
      return '生成例句失败，请检查 API Key 或网络设置。';
  }
};
