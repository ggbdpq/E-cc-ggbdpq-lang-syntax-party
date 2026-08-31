import { useEffect, useRef, useState } from 'react';
import type { NavSection } from '@/data/types';
import type { UiLang } from '@/i18n';
import { UI, t } from '@/i18n';

interface Props {
  uiLang: UiLang;
  /** 导航图分区：分类 + 可跳转主题 */
  sections: NavSection[];
}

const btnClass =
  'flex h-11 w-11 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/95 text-zinc-300 shadow-lg shadow-black/40 backdrop-blur transition hover:border-sky-500 hover:text-sky-300';

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
      <path d="M9 4v14" />
      <path d="M15 6v14" />
    </svg>
  );
}

export default function FloatNav({ uiLang, sections }: Props) {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.round((el.scrollTop / max) * 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 点击面板外部时收起导航图
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToBottom = () =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });

  const jumpTo = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div ref={rootRef} className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-2">
      {/* 导航图面板 */}
      {open && (
        <div className="mb-1 max-h-[62vh] w-64 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900/95 p-3 shadow-2xl shadow-black/60 backdrop-blur">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {t(UI.navMap, uiLang)} · {t(UI.navMapDesc, uiLang)}
          </p>
          <nav className="space-y-3">
            {sections.map((sec) => (
              <div key={sec.id}>
                <p className="px-1 text-[13px] font-semibold" style={{ color: sec.color }}>
                  {t(sec.title, uiLang)}
                </p>
                <ul className="mt-0.5">
                  {sec.topics.map((topic) => (
                    <li key={topic.id}>
                      <button
                        onClick={() => jumpTo(topic.id)}
                        className="block w-full rounded px-2 py-0.5 text-left text-[13px] text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
                      >
                        {t(topic.title, uiLang)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      )}

      {/* 阅读进度 */}
      <span className="rounded-full border border-zinc-700 bg-zinc-900/95 px-2 py-0.5 text-[11px] tabular-nums text-zinc-400 shadow backdrop-blur">
        {progress}%
      </span>

      {/* 回到顶部 */}
      <button onClick={scrollToTop} className={btnClass} title={t(UI.backToTop, uiLang)} aria-label={t(UI.backToTop, uiLang)}>
        <ArrowUpIcon />
      </button>

      {/* 导航图开关 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`${btnClass} ${open ? 'border-sky-500 text-sky-300' : ''}`}
        title={t(UI.navMap, uiLang)}
        aria-label={t(UI.navMap, uiLang)}
      >
        <MapIcon />
      </button>

      {/* 回到底部 */}
      <button onClick={scrollToBottom} className={btnClass} title={t(UI.backToBottom, uiLang)} aria-label={t(UI.backToBottom, uiLang)}>
        <ArrowDownIcon />
      </button>
    </div>
  );
}
