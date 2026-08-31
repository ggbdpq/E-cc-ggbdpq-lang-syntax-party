import { CATEGORIES } from '@/data';
import { FRAMEWORKS } from '@/data/frameworks';
import { frameworkPractice } from '@/data/c10-framework-practice';
import { LANGUAGES } from '@/data/types';
import type { LangId } from '@/data/types';
import type { UiLang } from '@/i18n';
import { UI, t } from '@/i18n';

interface Props {
  uiLang: UiLang;
  activeLangs: LangId[];
}

export default function Sidebar({ uiLang, activeLangs }: Props) {
  return (
    <aside className="sticky top-20 hidden max-h-[calc(100vh-6rem)] w-56 shrink-0 overflow-y-auto pr-4 lg:block">
      <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {t(UI.contents, uiLang)}
      </p>
      <nav className="space-y-4">
        {CATEGORIES.map((cat) => (
          <div key={cat.id}>
            <p className="px-2 text-sm font-semibold text-zinc-300">{t(cat.title, uiLang)}</p>
            <ul className="mt-1 space-y-0.5 border-l border-zinc-800">
              {cat.topics.map((topic) => (
                <li key={topic.id}>
                  <a
                    href={`#${topic.id}`}
                    className="block border-l-2 border-transparent py-1 pl-3 text-[13px] text-zinc-500 transition hover:border-sky-400 hover:text-zinc-100"
                  >
                    {t(topic.title, uiLang)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* 框架实战 */}
        <div>
          <p className="px-2 text-sm font-semibold text-emerald-300">
            {t(UI.practiceTitle, uiLang)}
          </p>
          <ul className="mt-1 space-y-0.5 border-l border-zinc-800">
            {frameworkPractice.topics.map((topic) => (
              <li key={topic.id}>
                <a
                  href={`#${topic.id}`}
                  className="block border-l-2 border-transparent py-1 pl-3 text-[13px] text-zinc-500 transition hover:border-emerald-400 hover:text-zinc-100"
                >
                  {t(topic.title, uiLang)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* 框架生态 */}
        <div>
          <p className="px-2 text-sm font-semibold text-amber-300">
            {t(UI.frameworksTitle, uiLang)}
          </p>
          <ul className="mt-1 space-y-0.5 border-l border-zinc-800">
            {FRAMEWORKS.filter((g) => activeLangs.includes(g.lang)).map((group) => {
              const meta = LANGUAGES.find((l) => l.id === group.lang)!;
              return (
                <li key={group.lang}>
                  <a
                    href={`#fw-${group.lang}`}
                    className="flex items-center gap-2 border-l-2 border-transparent py-1 pl-3 text-[13px] text-zinc-500 transition hover:border-amber-400 hover:text-zinc-100"
                  >
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: meta.color }}
                    />
                    {meta.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
