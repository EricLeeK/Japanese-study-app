
import React, { useState, useEffect } from 'react';
import { Key, Save, X, ShieldAlert, Cpu, Sparkles } from 'lucide-react';
import { AIConfig, AIProvider } from '../types';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('nihongo_ai_config');
      if (stored) {
        const config: AIConfig = JSON.parse(stored);
        setProvider(config.provider);
        setApiKey(config.apiKey);
        setModel(config.model);
      } else {
        // Migration check
        const legacyKey = localStorage.getItem('nihongo_gemini_key');
        if (legacyKey) {
          setProvider('gemini');
          setApiKey(legacyKey);
          setModel('gemini-2.5-flash');
        }
      }
    }
  }, [isOpen]);

  // Set default models when switching providers if empty
  useEffect(() => {
    if (provider === 'gemini' && !model.includes('gemini')) {
      setModel('gemini-2.5-flash');
    } else if (provider === 'siliconflow' && !model.includes('deepseek')) {
      setModel('deepseek-ai/DeepSeek-V3');
    }
  }, [provider]);

  const handleSave = () => {
    const config: AIConfig = {
      provider,
      apiKey: apiKey.trim(),
      model: model.trim()
    };
    
    if (config.apiKey) {
      localStorage.setItem('nihongo_ai_config', JSON.stringify(config));
    } else {
      localStorage.removeItem('nihongo_ai_config');
    }
    
    onClose();
    alert('配置已保存！');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Key size={20} className="text-yellow-400" />
            <h3 className="font-bold text-lg">配置 AI 服务</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">选择服务提供商</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setProvider('gemini')}
                className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${
                  provider === 'gemini' 
                  ? 'bg-white text-teal-600 shadow' 
                  : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                <Sparkles size={16} />
                Google Gemini
              </button>
              <button
                onClick={() => setProvider('siliconflow')}
                className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${
                  provider === 'siliconflow' 
                  ? 'bg-white text-indigo-600 shadow' 
                  : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                <Cpu size={16} />
                硅基流动 (DeepSeek)
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded text-sm text-amber-800">
            <div className="flex items-start gap-2">
              <ShieldAlert size={16} className="mt-0.5 shrink-0" />
              <div>
                {provider === 'gemini' ? (
                  <p>需要 <strong>Google Gemini API Key</strong>。<br />需魔法网络。</p>
                ) : (
                  <p>需要 <strong>硅基流动 API Key</strong>。<br />国内直连，速度快，DeepSeek模型成本低。</p>
                )}
                <a 
                  href={provider === 'gemini' ? "https://aistudio.google.com/app/apikey" : "https://cloud.siliconflow.cn/account/ak"} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="underline font-bold mt-1 inline-block hover:text-amber-900"
                >
                  点击获取 API Key
                </a>
              </div>
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={provider === 'gemini' ? "AIzaSy..." : "sk-..."}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">模型名称 (Model Name)</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={provider === 'gemini' ? "gemini-2.5-flash" : "deepseek-ai/DeepSeek-V3"}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-mono text-sm bg-slate-50"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {provider === 'siliconflow' ? "推荐: deepseek-ai/DeepSeek-V3 或 deepseek-ai/DeepSeek-R1" : "推荐: gemini-2.5-flash"}
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <Save size={18} />
            保存配置
          </button>
          
          <p className="text-[10px] text-center text-slate-400">
            配置仅保存在本地浏览器缓存中。
          </p>
        </div>
      </div>
    </div>
  );
};
