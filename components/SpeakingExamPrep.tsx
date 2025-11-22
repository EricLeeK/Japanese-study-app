
import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, Square, Play, RotateCcw, ArrowLeft, Volume2, 
  CheckCircle2, EyeOff, Zap, MessageCircle, Layers, HelpCircle, Bot, User, Send, Loader2, Sparkles, PenTool
} from 'lucide-react';
import { startRolePlay, continueRolePlay, generateSpeakingQuestion, evaluateSpeakingAnswer } from '../services/geminiService';

// --- Data Structures ---

const SCRIPTS = [
  {
    id: 'intro',
    title: '1. 自己紹介 (Self Intro)',
    jp: `はじめまして。私は リ・シーヤオ です。
中国から 来ました。
今、北海道大学（ほっかいどうだいがく） の 留学生（りゅうがくせい） です。
札幌（さっぽろ） に 住んで（すんで）います。
専門（せんもん）は [你的专业] です。
趣味（しゅみ）は 旅行（りょこう） と 写真（しゃしん） です。
北海道（ほっかいどう）は とても きれいですから、大好きです。
以上です。`,
    clozeJp: `はじめまして。私は リ・シーヤオ です。
中国[から] 来ました。
今、北海道大学 の 留学生 [です]。
札幌 [に] 住んで[います]。
専門[は] [你的专业] です。
趣味[は] 旅行 [と] 写真 です。
北海道[は] とても きれいです[から]、大好きです。
以上です。`,
    tips: '强调“留学生”身份和“札幌”生活。这是加分项！'
  },
  {
    id: 'routine',
    title: '2. 毎日のスケジュール (Routine)',
    jp: `私は 毎日 朝 7時半（しちじはん） に 起きます。
それから、朝ごはんを 食べます。
8時半（はちじはん） に 自転車（じてんしゃ）で 大学へ 行きます。
9時 から 4時 まで 大学で 勉強します。
昼ごはんは 学食（がくしょく） で 食べます。
夜は 寮（りょう）で 勉強します。
毎日 12時（じゅうにじ） ごろ 寝ます。`,
    clozeJp: `私は 毎日 朝 7時半 [に] 起きます。
それから、朝ごはん[を] 食べます。
8時半 [に] 自転車[で] 大学[へ] 行きます。
9時 [から] 4時 [まで] 大学[で] 勉強します。
昼ごはん[は] 学食 [で] 食べます。
夜[は] 寮[で] 勉強します。
毎日 12時 ごろ 寝[ます]。`,
    tips: '使用时间词 (に/から/まで) 和动词ます形。'
  },
  {
    id: 'weekend',
    title: '3. 週末について (Weekend)',
    jp: `先週の 週末、友達と 小樽（おたる） へ 行きました。
私たちは 古い 建物（たてもの）を 見ました。とても きれいでした。
それから、お寿司（すし）を 食べました。
小樽の お寿司は 新鮮（しんせん）で、おいしかった です。
とても 楽しかった です。`,
    clozeJp: `先週の 週末、友達[と] 小樽 [へ] 行き[ました]。
私たちは 古い 建物[を] 見[ました]。とても きれい[でした]。
それから、お寿司[を] 食べ[ました]。
小樽の お寿司[は] 新鮮[で]、おいし[かった] です。
とても 楽し[かった] です。`,
    tips: '注意过去式！～ました / ～かったです。'
  },
  {
    id: 'roleplay',
    title: '4. 会話 (Roleplay)',
    jp: `(老师) リさん、映画が 好きですか。
(あなた) ええ、好きですよ。実は、映画の チケットが 2枚 あります。日曜日、一緒に 行きませんか。
(老师) いいですね。行きましょう。映画は 何時ですか。
(あなた) 映画は、日曜日の 午後 1時 からです。場所は、札幌駅 です。
(老师) わかりました。どこで 会いましょうか。
(あなた) じゃ、12時半 に、札幌駅の 北口 で 会いましょう。`,
    clozeJp: null, 
    roleplayData: [
      { role: 'teacher', text: 'リさん、映画が 好きですか？', hint: 'Confirm you like it & Invite' },
      { role: 'student', text: 'ええ、好きですよ。実は、映画の チケットが 2枚 あります。日曜日、一緒に 行きませんか。', hint: 'Yes... Actually I have 2 tickets... Sunday wont you go?' },
      { role: 'teacher', text: 'いいですね。行きましょう。映画は 何時からですか？', hint: 'Explain time (1PM) and location (Sapporo Stn)' },
      { role: 'student', text: '映画は、日曜日の 午後 1時 からです。場所は、札幌駅 です。', hint: '1 PM... Sapporo Station' },
      { role: 'teacher', text: 'わかりました。どこで 会いましょうか？', hint: 'Set meeting time (12:30) and specific place (North Gate)' },
      { role: 'student', text: 'じゃ、12時半 に、札幌駅の 北口 で 会いましょう。', hint: '12:30... Sapporo Station North Gate' },
    ],
    tips: '逻辑：确认喜好 -> 邀请 (ませんか) -> 说明时间地点 -> 约定见面 (北口)'
  }
];

const DEFAULT_QA = [
  { q: '毎朝、何時に 起きますか？', a: '7時半に 起きます。' },
  { q: '大学まで どうやって 行きますか？', a: '自転車で 行きます。' },
  { q: '専門は 何ですか？', a: '私の専門は [你的专业] です。' },
  { q: '週末、どこか 行きましたか？', a: 'はい、小樽へ 行きました。' },
  { q: '札幌の生活は どうですか？', a: '寒いですけど、とても 楽しいです。' },
  { q: '昼ごはんは どこで 食べますか？', a: '大学の 学食で 食べます。' },
];

// --- Sub-Components ---

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('无法访问麦克风，请检查权限。');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
      <div>
        <h4 className="font-bold text-slate-700 text-sm mb-1">🔴 录音自测</h4>
        <p className="text-xs text-slate-400">录下你的发音，回放对比。</p>
      </div>
      <div className="flex items-center gap-2">
        {!isRecording ? (
          <button 
            onClick={startRecording}
            className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-200 transition-colors"
          >
            <Mic size={20} />
          </button>
        ) : (
          <button 
            onClick={stopRecording}
            className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors animate-pulse"
          >
            <Square size={20} fill="currentColor" />
          </button>
        )}
        
        {audioUrl && !isRecording && (
          <audio src={audioUrl} controls className="h-8 w-32 md:w-48" />
        )}
      </div>
    </div>
  );
};

const ShadowingPlayer: React.FC<{ text: string }> = ({ text }) => {
  const [speed, setSpeed] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = () => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.rate = speed;
    u.onend = () => setIsPlaying(false);
    
    setIsPlaying(true);
    window.speechSynthesis.speak(u);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <div className="flex items-center gap-4 bg-teal-50 p-3 rounded-lg border border-teal-100 mb-4">
       <div className="flex items-center gap-2">
         <button 
            onClick={() => setSpeed(0.8)}
            className={`text-xs font-bold px-2 py-1 rounded ${speed === 0.8 ? 'bg-teal-600 text-white' : 'bg-white text-teal-600'}`}
         >
            0.8x
         </button>
         <button 
            onClick={() => setSpeed(1.0)}
            className={`text-xs font-bold px-2 py-1 rounded ${speed === 1.0 ? 'bg-teal-600 text-white' : 'bg-white text-teal-600'}`}
         >
            1.0x
         </button>
       </div>

       <div className="flex-1"></div>

       <button 
          onClick={isPlaying ? stop : speak}
          className={`p-2 rounded-full shadow-sm ${isPlaying ? 'bg-amber-500 text-white' : 'bg-teal-600 text-white'} transition-colors`}
       >
          {isPlaying ? <Square size={16} fill="currentColor" /> : <Volume2 size={18} />}
       </button>
    </div>
  );
};

const ClozeRenderer: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\[.*?\])/g);

  return (
    <div className="text-lg leading-loose font-medium text-slate-700 font-serif">
      {parts.map((part, i) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          const answer = part.slice(1, -1);
          return (
            <ClozeButton key={i} answer={answer} />
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
};

const ClozeButton: React.FC<{ answer: string }> = ({ answer }) => {
  const [revealed, setRevealed] = useState(false);
  return (
    <button
      onClick={() => setRevealed(true)}
      className={`mx-1 px-2 py-0.5 rounded min-w-[3rem] border-b-2 transition-all align-baseline ${
        revealed 
        ? 'bg-transparent border-teal-500 text-teal-700 font-bold' 
        : 'bg-slate-200 border-slate-300 text-transparent hover:bg-slate-300'
      }`}
    >
      {answer}
    </button>
  );
};

const RolePlaySimulator: React.FC<{ data: {role: string, text: string, hint: string}[] }> = ({ data }) => {
  const [mode, setMode] = useState<'script' | 'ai'>('script');
  const [step, setStep] = useState(0);
  const [showHint, setShowHint] = useState(false);
  
  // AI State
  const [aiHistory, setAiHistory] = useState<{role: 'model' | 'user', text: string}[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Script Mode Logic
  const current = data[step];
  const isFinished = step >= data.length;

  const handleNext = () => {
    if (step < data.length - 1) {
      setStep(prev => prev + 1);
      setShowHint(false);
    } else {
      setStep(prev => prev + 1);
    }
  };

  // AI Mode Logic
  const startAiSession = async () => {
    setIsAiLoading(true);
    setAiHistory([]);
    const opening = await startRolePlay("Inviting a friend to a movie on Sunday (Lesson 6 Grammar)");
    setAiHistory([{ role: 'model', text: opening }]);
    setIsAiLoading(false);
  };

  const sendAiMessage = async () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput;
    setAiHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiInput('');
    setIsAiLoading(true);
    
    const aiResponse = await continueRolePlay(aiHistory.map(h => ({ role: h.role, text: h.text })), userMsg);
    setAiHistory(prev => [...prev, { role: 'model', text: aiResponse }]);
    setIsAiLoading(false);
  };

  useEffect(() => {
    if (mode === 'ai' && aiHistory.length === 0) {
        startAiSession();
    }
  }, [mode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiHistory]);


  return (
    <div className="h-[500px] flex flex-col">
      {/* Mode Toggle */}
      <div className="flex justify-center gap-4 mb-4 border-b border-slate-100 pb-2">
         <button 
           onClick={() => setMode('script')}
           className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${mode === 'script' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400'}`}
         >
            剧本模式 (Script)
         </button>
         <button 
           onClick={() => setMode('ai')}
           className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 ${mode === 'ai' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
         >
            <Sparkles size={12} /> AI 实战 (Live)
         </button>
      </div>

      {mode === 'script' ? (
        // --- Existing Script Mode ---
        isFinished ? (
            <div className="text-center py-10 flex-1 flex flex-col items-center justify-center">
                <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800">会話練習完了！</h3>
                <button onClick={() => setStep(0)} className="mt-4 text-indigo-600 font-bold hover:underline">
                もう一度 (Again)
                </button>
            </div>
        ) : (
            <>
            <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                {data.slice(0, step + 1).map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                    msg.role === 'student' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 shadow-sm border border-slate-200 rounded-tl-none'
                    }`}>
                    <div className="text-[10px] opacity-70 mb-1 uppercase font-bold">
                        {msg.role === 'teacher' ? '先生' : 'あなた'}
                    </div>
                    {msg.role === 'student' && i === step && !showHint ? (
                        <div className="italic opacity-90 flex items-center gap-2">
                            <HelpCircle size={14} /> 点击下方提示...
                        </div>
                    ) : (
                        msg.text
                    )}
                    </div>
                </div>
                ))}
            </div>
            <div className="bg-white p-4 border-t border-slate-100 mt-auto">
                {current.role === 'teacher' ? (
                <div className="text-center">
                    <p className="text-slate-500 text-sm mb-2">老师正在说话...</p>
                    <button onClick={handleNext} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">
                        听懂了，下一步 (Next)
                    </button>
                </div>
                ) : (
                <div>
                    <p className="text-xs text-slate-400 font-bold mb-2 uppercase">你的回合 (Your Turn)</p>
                    {!showHint ? (
                        <button 
                        onClick={() => setShowHint(true)}
                        className="w-full bg-amber-100 text-amber-800 py-3 rounded-lg font-bold mb-2 hover:bg-amber-200 transition-colors"
                        >
                        显示提示 (Hint): {current.hint}
                        </button>
                    ) : (
                        <div className="space-y-2 animate-fade-in">
                            <div className="p-3 bg-blue-50 text-blue-800 font-bold rounded-lg border border-blue-100 text-center">
                            {current.text}
                            </div>
                            <VoiceRecorder />
                            <button onClick={handleNext} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">
                            说完了，下一步
                            </button>
                        </div>
                    )}
                </div>
                )}
            </div>
            </>
        )
      ) : (
        // --- AI Live Mode ---
        <>
            <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-slate-100 rounded-xl border border-slate-200">
                {aiHistory.map((msg, i) => (
                     <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-600'}`}>
                                 {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                             </div>
                             <div className={`p-3 rounded-xl text-sm ${
                                msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : 'bg-white text-slate-800 shadow-sm rounded-tl-none'
                             }`}>
                                {msg.text}
                             </div>
                         </div>
                     </div>
                ))}
                {isAiLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white px-3 py-2 rounded-full text-xs text-slate-400 flex items-center gap-1 shadow-sm">
                            <Loader2 size={12} className="animate-spin" /> 先生は入力中...
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            
            <div className="mt-4 bg-white">
                <div className="flex gap-2">
                    <input 
                       type="text" 
                       value={aiInput}
                       onChange={e => setAiInput(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && sendAiMessage()}
                       placeholder="用日语回复..."
                       disabled={isAiLoading}
                       className="flex-1 border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button 
                       onClick={sendAiMessage}
                       disabled={!aiInput.trim() || isAiLoading}
                       className="bg-indigo-600 text-white px-4 rounded-lg disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </>
      )}
    </div>
  );
};

const RandomQA: React.FC = () => {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [cards, setCards] = useState(DEFAULT_QA);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const card = cards[idx];

  const nextCard = () => {
    const next = Math.floor(Math.random() * cards.length);
    setIdx(next);
    setFlipped(false);
    setFeedback(null);
    setUserAnswer('');
  };

  const generateAIQuestion = async () => {
    setIsLoading(true);
    const newCard = await generateSpeakingQuestion();
    setCards(prev => [...prev, newCard]);
    setIdx(cards.length); // Set to the new card (last index)
    setFlipped(false);
    setFeedback(null);
    setUserAnswer('');
    setIsLoading(false);
  };

  const checkAnswer = async () => {
    if (!userAnswer.trim()) return;
    setIsLoading(true);
    const res = await evaluateSpeakingAnswer(card.q, userAnswer);
    setFeedback(res);
    setIsLoading(false);
  };

  return (
    <div className="text-center py-6">
      <div className="mb-4 flex justify-between items-center px-4">
        <h3 className="font-bold text-slate-700">⚡ 随机提问 (Rapid Fire)</h3>
        <button 
            onClick={generateAIQuestion}
            disabled={isLoading}
            className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-bold flex items-center gap-1 hover:bg-indigo-200 transition-colors"
        >
           {isLoading ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12} />} AI 出题
        </button>
      </div>

      <div 
        onClick={() => setFlipped(!flipped)}
        className="relative h-64 w-full perspective-1000 cursor-pointer group mb-8"
      >
         <div className={`relative w-full h-full transition-all duration-500 transform-style-3d shadow-lg rounded-2xl border border-slate-200 ${flipped ? 'rotate-y-180' : ''}`}>
            
            {/* Front */}
            <div className="absolute w-full h-full bg-white rounded-2xl p-8 flex flex-col items-center justify-center backface-hidden">
               <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Teacher Asks</div>
               <div className="text-xl font-bold text-slate-800">{card.q}</div>
               <div className="mt-6 text-teal-600 text-sm flex items-center gap-1 animate-pulse">
                 <Zap size={14} /> 点击查看参考回答
               </div>
            </div>

            {/* Back */}
            <div className="absolute w-full h-full bg-indigo-600 rounded-2xl p-8 flex flex-col items-center justify-center backface-hidden rotate-y-180 text-white">
               <div className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-4">Sample Answer</div>
               <div className="text-xl font-bold">{card.a}</div>
               <button 
                 onClick={(e) => { e.stopPropagation(); nextCard(); }}
                 className="mt-6 bg-white text-indigo-600 px-4 py-2 rounded-full text-sm font-bold hover:bg-indigo-50"
               >
                 下一题
               </button>
            </div>
         </div>
      </div>

      {/* AI Evaluation Area */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left">
         <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
            <PenTool size={12} /> 试着回答 (AI 评分)
         </h4>
         <div className="flex gap-2 mb-3">
            <input 
              type="text" 
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              placeholder="输入你的日语回答..."
              className="flex-1 p-2 border border-slate-300 rounded text-sm"
            />
            <button 
               onClick={checkAnswer}
               disabled={isLoading || !userAnswer.trim()}
               className="bg-teal-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-teal-700 disabled:opacity-50"
            >
               检查
            </button>
         </div>
         {feedback && (
            <div className="text-sm text-slate-700 bg-white p-3 rounded border border-teal-100 animate-fade-in">
               <span className="font-bold text-teal-600 block mb-1">AI 建议:</span>
               {feedback}
            </div>
         )}
      </div>
    </div>
  );
};

// --- Main Component ---

export const SpeakingExamPrep: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeScript, setActiveScript] = useState(0);
  const [activeTab, setActiveTab] = useState<'script' | 'shadowing' | 'cloze' | 'roleplay' | 'qa'>('script');

  const current = SCRIPTS[activeScript];

  useEffect(() => {
    if (activeTab === 'roleplay' && current.id !== 'roleplay') {
        const rpIdx = SCRIPTS.findIndex(s => s.id === 'roleplay');
        if (rpIdx !== -1) setActiveScript(rpIdx);
    }
  }, [activeTab]);

  return (
    <div className="animate-fade-in pb-24 md:pb-0">
      {/* Top Navigation Bar */}
      <div className="bg-white p-4 border-b border-slate-100 sticky top-[4.5rem] z-20 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
                <ArrowLeft size={20} />
            </button>
            <div>
                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded inline-block">
                    HOKUDAI EXAM PREP
                </div>
                <h2 className="font-bold text-slate-800">口语考试特训</h2>
            </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
           {[
             { id: 'script', label: '文稿', icon: Layers },
             { id: 'shadowing', label: '跟读', icon: Volume2 },
             { id: 'cloze', label: '填空', icon: EyeOff },
             { id: 'roleplay', label: '模拟对话', icon: MessageCircle },
             { id: 'qa', label: '随机抽题', icon: Zap },
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                 activeTab === tab.id 
                 ? 'bg-blue-600 text-white shadow-md' 
                 : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
               }`}
             >
               <tab.icon size={16} />
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 max-w-4xl mx-auto">
        
        {/* Sidebar: Script Selector (Hidden if QA mode) */}
        {activeTab !== 'qa' && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Topics</h3>
            {SCRIPTS.map((s, idx) => (
                <button
                key={s.id}
                onClick={() => setActiveScript(idx)}
                className={`w-full text-left p-3 rounded-lg border transition-all flex justify-between items-center text-sm ${
                    activeScript === idx 
                    ? 'border-blue-500 bg-blue-50 text-blue-800 font-bold' 
                    : 'border-transparent bg-white hover:bg-slate-50 text-slate-600'
                }`}
                >
                {s.title}
                </button>
            ))}
            
            <div className="mt-4 bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-800 text-xs">
                <h4 className="font-bold mb-2 flex items-center gap-1"><Zap size={14} className="fill-amber-600" /> 考试重点</h4>
                <p>{current.tips}</p>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className={activeTab === 'qa' ? 'col-span-3' : 'md:col-span-2'}>
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] p-6">
              
              {/* 1. Script View */}
              {activeTab === 'script' && (
                 <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-4">{current.title}</h3>
                    <div className="text-lg leading-loose font-medium text-slate-700 whitespace-pre-wrap font-serif border-l-4 border-blue-200 pl-4">
                      {current.jp}
                    </div>
                    <div className="mt-8">
                       <VoiceRecorder />
                    </div>
                 </div>
              )}

              {/* 2. Shadowing Mode */}
              {activeTab === 'shadowing' && (
                 <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                       <Volume2 className="text-teal-600" /> 影子跟读
                    </h3>
                    <ShadowingPlayer text={current.jp} />
                    <div className="text-lg leading-loose font-medium text-slate-500 whitespace-pre-wrap font-serif opacity-80 mt-6">
                      {current.jp}
                    </div>
                 </div>
              )}

              {/* 3. Cloze Test */}
              {activeTab === 'cloze' && (
                 <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                       <EyeOff className="text-rose-500" /> 挖空填词
                    </h3>
                    <p className="text-sm text-slate-400 mb-6">点击 [ ] 中的空白处显示正确答案。</p>
                    {current.clozeJp ? (
                        <ClozeRenderer key={current.id} text={current.clozeJp} />
                    ) : (
                        <div className="text-center py-10 text-slate-400 italic">此部分暂不支持填空模式 (建议使用模拟对话)。</div>
                    )}
                 </div>
              )}

              {/* 4. Roleplay */}
              {activeTab === 'roleplay' && (
                 <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                       <MessageCircle className="text-indigo-500" /> 模拟对话
                    </h3>
                    {current.roleplayData ? (
                        <RolePlaySimulator data={current.roleplayData} />
                    ) : (
                        <div className="text-center py-10 text-slate-400 italic">请在左侧选择 "4. 会話 (Roleplay)" 话题。</div>
                    )}
                 </div>
              )}

              {/* 5. Random QA */}
              {activeTab === 'qa' && (
                 <div className="max-w-md mx-auto">
                    <RandomQA />
                 </div>
              )}

           </div>
        </div>

      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};
