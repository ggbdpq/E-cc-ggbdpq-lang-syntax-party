import { useState } from 'react';
import { Routes, Route } from 'react-router';
import { ALL_LANGS } from '@/data';
import type { LangId } from '@/data/types';
import type { UiLang } from '@/i18n';
import Header from '@/components/Header';
import Home from '@/pages/Home';
import JsonGuide from '@/pages/JsonGuide';
import GitGuide from '@/pages/GitGuide';
import MysqlGuide from '@/pages/MysqlGuide';
import Labs from '@/pages/Labs';
import FullstackGuide from '@/pages/FullstackGuide';

export default function App() {
  const [uiLang, setUiLang] = useState<UiLang>('zh');
  const [activeLangs, setActiveLangs] = useState<LangId[]>(ALL_LANGS);

  const toggleLang = (id: LangId) => {
    setActiveLangs((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <Header
        uiLang={uiLang}
        onToggleUiLang={() => setUiLang((l) => (l === 'zh' ? 'en' : 'zh'))}
        activeLangs={activeLangs}
        onToggleLang={toggleLang}
      />
      <Routes>
        <Route path="/" element={<Home uiLang={uiLang} activeLangs={activeLangs} />} />
        <Route path="/fullstack" element={<FullstackGuide uiLang={uiLang} activeLangs={activeLangs} />} />
        <Route path="/json" element={<JsonGuide uiLang={uiLang} activeLangs={activeLangs} />} />
        <Route path="/git" element={<GitGuide uiLang={uiLang} />} />
        <Route path="/mysql" element={<MysqlGuide uiLang={uiLang} activeLangs={activeLangs} />} />
        <Route path="/labs" element={<Labs uiLang={uiLang} activeLangs={activeLangs} />} />
      </Routes>
    </div>
  );
}
