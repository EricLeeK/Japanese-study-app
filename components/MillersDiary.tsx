import React, { useState, useEffect } from 'react';
import { Quote, RefreshCw } from 'lucide-react';

// Mock diary entries based on Minna no Nihongo style content
const DIARY_ENTRIES = [
  {
    date: '5月5日',
    weather: '晴れ',
    jp: 'きょうは 日曜日です。私は パワー電気の 社員と お花見に行きました。桜は とても きれいでした。',
    cn: '今天是星期天。我和动力电公司的职员去赏花了。樱花非常漂亮。'
  },
  {
    date: '5月6日',
    weather: '雨',
    jp: 'あしたから 東京へ 出張します。新幹線で 行きます。大阪から 東京まで 2時間半ぐらい かかります。',
    cn: '明天开始去东京出差。坐新干线去。从大阪到东京大约花2个半小时。'
  },
  {
    date: '5月10日',
    weather: '曇り',
    jp: 'あさって 誕生日です。マリアさんに すてきな 傘を もらいました。とても うれしいです。',
    cn: '后天是生日。从玛利亚小姐那里得到了一把漂亮的伞。非常开心。'
  },
  {
    date: '6月1日',
    weather: '晴れ',
    jp: 'きょうは 暑かったです。仕事を 休んで、海へ 行きました。',
    cn: '今天很热。请假去了海边。'
  },
  {
    date: '7月7日',
    weather: '雨',
    jp: '日本の 生活は おもしろいですが、物価が 高いです。',
    cn: '日本的生活虽然很有趣，但是物价很高。'
  }
];

export const MillersDiary: React.FC = () => {
  const [entry, setEntry] = useState(DIARY_ENTRIES[0]);

  useEffect(() => {
    // Randomize on mount
    const randomIdx = Math.floor(Math.random() * DIARY_ENTRIES.length);
    setEntry(DIARY_ENTRIES[randomIdx]);
  }, []);

  const refresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    let newIdx;
    do {
        newIdx = Math.floor(Math.random() * DIARY_ENTRIES.length);
    } while (DIARY_ENTRIES[newIdx] === entry);
    setEntry(DIARY_ENTRIES[newIdx]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden relative group hover:shadow-md transition-all">
      <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500"></div>
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-full bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Miller&gender=male`} alt="Miller" className="w-full h-full" />
             </div>
             <div>
                <h3 className="font-bold text-slate-800">ミラーさんの日記</h3>
                <p className="text-xs text-slate-400 font-mono">Miller's Diary • {entry.date} • {entry.weather}</p>
             </div>
          </div>
          <button onClick={refresh} className="text-slate-300 hover:text-indigo-500 transition-colors">
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="relative bg-slate-50 p-4 rounded-xl rounded-tl-none">
          <Quote size={20} className="absolute top-2 left-2 text-indigo-200 -z-0" />
          <p className="text-lg font-medium text-slate-700 mb-2 relative z-10 font-serif leading-relaxed">
            {entry.jp}
          </p>
          <p className="text-sm text-slate-500 border-t border-slate-200 pt-2 mt-2">
            {entry.cn}
          </p>
        </div>
      </div>
    </div>
  );
};