import { NavLink, useLocation } from 'react-router';
import { LANGUAGES } from '@/data/types';
import type { LangId } from '@/data/types';
import type { UiLang } from '@/i18n';
import { UI, t } from '@/i18n';

interface Props {
  uiLang: UiLang;
  onToggleUiLang: () => void;
  activeLangs: LangId[];
  onToggleLang: (id: LangId) => void;
}

const TABS = [
  { to: '/', icon: '🎉', label: UI.tabSyntax, end: true, showLangs: true },
  { to: '/fullstack', icon: '🛠️', label: UI.tabFullstack, end: false, showLangs: true },
  { to: '/json', icon: '📦', label: UI.tabJson, end: false, showLangs: true },
  { to: '/git', icon: '🌿', label: UI.tabGit, end: false, showLangs: false },
  { to: '/mysql', icon: '🐬', label: UI.tabMysql, end: false, showLangs: true },
  { to: '/labs', icon: '🧪', label: UI.tabLabs, end: false, showLangs: true },
];

export default function Header({ uiLang, onToggleUiLang, activeLangs, onToggleLang }: Props) {
  const { pathname } = useLocation();
  const tab = TABS.find((tb) => (tb.end ? pathname === tb.to : pathname.startsWith(tb.to)));
  const showLangs = tab?.showLangs ?? true;

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-x-4 gap-y-2 px-4 pt-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎉</span>
          <h1 className="text-base font-bold text-zinc-100">{t(UI.siteTitle, uiLang)}</h1>
          <span className="hidden text-xs text-zinc-500 sm:inline">{t(UI.tagline, uiLang)}</span>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {showLangs && (
            <div className="flex items-center gap-1.5" title={t(UI.languages, uiLang)}>
              {LANGUAGES.map((meta) => {
                const active = activeLangs.includes(meta.id);
                return (
                  <button
                    key={meta.id}
                    onClick={() => onToggleLang(meta.id)}
                    className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                      active
                        ? 'border-zinc-600 bg-zinc-800 text-zinc-100'
                        : 'border-zinc-800 bg-transparent text-zinc-600 line-through'
                    }`}
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: active ? meta.color : '#52525b' }}
                    />
                    {meta.name}
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={onToggleUiLang}
            className="rounded-full border border-sky-700 bg-sky-950 px-3 py-1 text-xs font-semibold text-sky-300 transition hover:bg-sky-900"
          >
            {uiLang === 'zh' ? 'EN' : '中文'}
          </button>
        </div>
      </div>

      {/* 学习路径页签 */}
      <nav
        className="mx-auto mt-2 flex max-w-[1800px] gap-1 overflow-x-auto px-4"
        aria-label={t(UI.learnPaths, uiLang)}
      >
        {TABS.map((tb) => (
          <NavLink
            key={tb.to}
            to={tb.to}
            end={tb.end}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-1.5 rounded-t-lg border-b-2 px-3.5 py-2 text-sm font-medium transition ${
                isActive
                  ? 'border-sky-400 bg-zinc-900 text-sky-300'
                  : 'border-transparent text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-200'
              }`
            }
          >
            <span>{tb.icon}</span>
            {t(tb.label, uiLang)}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
