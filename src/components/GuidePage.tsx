import type { Category, GuideCategory, NavSection, LangId } from '@/data/types';
import type { Bilingual } from '@/data/types';
import type { UiLang } from '@/i18n';
import { UI, t } from '@/i18n';
import GuideSection from '@/components/GuideSection';
import TopicSection from '@/components/TopicSection';
import FloatNav from '@/components/FloatNav';

interface Props {
  uiLang: UiLang;
  activeLangs: LangId[];
  /** Hero 区标题/描述/主题色（如 emerald / amber / orange） */
  heroTitle: Bilingual;
  heroDesc: Bilingual;
  accent: 'emerald' | 'amber' | 'violet' | 'sky';
  /** 顶部的统计小标签，已按当前 UI 语言渲染好 */
  stats: string[];
  /** 单语言教学分区 */
  categories: GuideCategory[];
  /** 可选：五语言对照板块（接在单语言分区之后） */
  compareCategories?: Category[];
}

const ACCENTS = {
  emerald: {
    heroText: 'text-emerald-300',
    navText: 'text-emerald-300',
    navColor: '#6ee7b7',
    gradient: 'from-emerald-950/40',
  },
  amber: {
    heroText: 'text-amber-300',
    navText: 'text-amber-300',
    navColor: '#fcd34d',
    gradient: 'from-amber-950/40',
  },
  violet: {
    heroText: 'text-violet-300',
    navText: 'text-violet-300',
    navColor: '#c4b5fd',
    gradient: 'from-violet-950/40',
  },
  sky: {
    heroText: 'text-sky-300',
    navText: 'text-sky-300',
    navColor: '#7dd3fc',
    gradient: 'from-sky-950/40',
  },
} as const;

/** 通用学习路径页（JSON / Git / MySQL 速成共用布局） */
export default function GuidePage({
  uiLang,
  activeLangs,
  heroTitle,
  heroDesc,
  accent,
  stats,
  categories,
  compareCategories,
}: Props) {
  const a = ACCENTS[accent];

  const navSections: NavSection[] = [
    ...categories.map((c) => ({
      id: c.id,
      title: c.title,
      color: a.navColor,
      topics: c.topics.map((tp) => ({ id: tp.id, title: tp.title })),
    })),
    ...(compareCategories ?? []).map((c) => ({
      id: c.id,
      title: c.title,
      color: '#7dd3fc',
      topics: c.topics.map((tp) => ({ id: tp.id, title: tp.title })),
    })),
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      {/* Hero */}
      <div className={`border-b border-zinc-800 bg-gradient-to-b ${a.gradient} to-zinc-950`}>
        <div className="mx-auto max-w-[1800px] px-4 py-10">
          <h2 className={`text-2xl font-extrabold tracking-tight sm:text-3xl ${a.heroText}`}>
            {t(heroTitle, uiLang)}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400">
            {t(heroDesc, uiLang)}
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500">
            {stats.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto flex max-w-[1800px] gap-6 px-4 py-8">
        {/* 左侧章节目录 */}
        <aside className="sticky top-28 hidden max-h-[calc(100vh-8rem)] w-56 shrink-0 overflow-y-auto pr-4 lg:block">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {t(UI.contents, uiLang)}
          </p>
          <nav className="space-y-4">
            {categories.map((c) => (
              <div key={c.id}>
                <p className={`px-2 text-sm font-semibold ${a.navText}`}>{t(c.title, uiLang)}</p>
                <ul className="mt-1 space-y-0.5 border-l border-zinc-800">
                  {c.topics.map((tp) => (
                    <li key={tp.id}>
                      <a
                        href={`#${tp.id}`}
                        className="block border-l-2 border-transparent py-1 pl-3 text-[13px] text-zinc-500 transition hover:border-sky-400 hover:text-zinc-100"
                      >
                        {t(tp.title, uiLang)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {(compareCategories ?? []).map((c) => (
              <div key={c.id}>
                <p className="px-2 text-sm font-semibold text-sky-300">{t(c.title, uiLang)}</p>
                <ul className="mt-1 space-y-0.5 border-l border-zinc-800">
                  {c.topics.map((tp) => (
                    <li key={tp.id}>
                      <a
                        href={`#${tp.id}`}
                        className="block border-l-2 border-transparent py-1 pl-3 text-[13px] text-zinc-500 transition hover:border-sky-400 hover:text-zinc-100"
                      >
                        {t(tp.title, uiLang)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 space-y-14">
          {categories.map((c) => (
            <div key={c.id}>
              <h2 className={`mb-6 border-b border-zinc-800 pb-2 text-xl font-extrabold ${a.heroText}`}>
                {t(c.title, uiLang)}
              </h2>
              <div className="space-y-10">
                {c.topics.map((tp) => (
                  <GuideSection key={tp.id} topic={tp} uiLang={uiLang} />
                ))}
              </div>
            </div>
          ))}

          {(compareCategories ?? []).map((c) => (
            <div key={c.id}>
              <h2 className="mb-6 border-b border-zinc-800 pb-2 text-xl font-extrabold text-sky-300">
                {t(c.title, uiLang)}
              </h2>
              <div className="space-y-10">
                {c.topics.map((tp) => (
                  <TopicSection
                    key={tp.id}
                    topic={tp}
                    activeLangs={activeLangs}
                    uiLang={uiLang}
                  />
                ))}
              </div>
            </div>
          ))}

          <footer className="border-t border-zinc-800 pt-6 pb-10 text-center text-xs text-zinc-600">
            {t(UI.footer, uiLang)}
          </footer>
        </main>
      </div>

      <FloatNav uiLang={uiLang} sections={navSections} />
    </div>
  );
}
