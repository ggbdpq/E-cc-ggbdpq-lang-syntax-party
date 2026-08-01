import { CATEGORIES } from '@/data';
import { FRAMEWORKS } from '@/data/frameworks';
import { frameworkPractice } from '@/data/c10-framework-practice';
import type { LangId, NavSection } from '@/data/types';
import type { UiLang } from '@/i18n';
import { UI, t } from '@/i18n';
import Sidebar from '@/components/Sidebar';
import TopicSection from '@/components/TopicSection';
import FrameworksSection from '@/components/FrameworksSection';
import FloatNav from '@/components/FloatNav';

interface Props {
  uiLang: UiLang;
  activeLangs: LangId[];
}

export default function Home({ uiLang, activeLangs }: Props) {
  const topicCount =
    CATEGORIES.reduce((n, c) => n + c.topics.length, 0) + frameworkPractice.topics.length;
  const frameworkCount = FRAMEWORKS.reduce((n, g) => n + g.frameworks.length, 0);

  const navSections: NavSection[] = [
    ...CATEGORIES.map((c) => ({
      id: c.id,
      title: c.title,
      color: '#7dd3fc',
      topics: c.topics.map((tp) => ({ id: tp.id, title: tp.title })),
    })),
    {
      id: 'framework-practice',
      title: UI.practiceTitle,
      color: '#6ee7b7',
      topics: frameworkPractice.topics.map((tp) => ({ id: tp.id, title: tp.title })),
    },
    {
      id: 'frameworks',
      title: UI.frameworksTitle,
      color: '#fcd34d',
      topics: [{ id: 'frameworks', title: UI.frameworksTitle }],
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      {/* Hero */}
      <div className="border-b border-zinc-800 bg-gradient-to-b from-sky-950/40 to-zinc-950">
        <div className="mx-auto max-w-[1800px] px-4 py-10">
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-50 sm:text-3xl">
            {t(UI.heroTitle, uiLang)}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400">
            {t(UI.heroDesc, uiLang)}
          </p>
          <div className="mt-4 flex gap-4 text-xs text-zinc-500">
            <span>
              {CATEGORIES.length} {t(UI.categories, uiLang)}
            </span>
            <span>
              {topicCount} {t(UI.topics, uiLang)}
            </span>
            <span>
              {frameworkCount} {t(UI.frameworks, uiLang)}
            </span>
            <span>× 5 languages</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto flex max-w-[1800px] gap-6 px-4 py-8">
        <Sidebar uiLang={uiLang} activeLangs={activeLangs} />

        <main className="min-w-0 flex-1 space-y-14">
          {CATEGORIES.map((cat) => (
            <div key={cat.id}>
              <h2 className="mb-6 border-b border-zinc-800 pb-2 text-xl font-extrabold text-sky-300">
                {t(cat.title, uiLang)}
              </h2>
              <div className="space-y-10">
                {cat.topics.map((topic) => (
                  <TopicSection
                    key={topic.id}
                    topic={topic}
                    activeLangs={activeLangs}
                    uiLang={uiLang}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* 框架实战板块 */}
          <div id="framework-practice" className="scroll-mt-32">
            <h2 className="mb-2 border-b border-zinc-800 pb-2 text-xl font-extrabold text-emerald-300">
              {t(UI.practiceTitle, uiLang)}
            </h2>
            <p className="mb-6 text-sm text-zinc-400">{t(UI.practiceDesc, uiLang)}</p>
            <div className="space-y-10">
              {frameworkPractice.topics.map((topic) => (
                <TopicSection
                  key={topic.id}
                  topic={topic}
                  activeLangs={activeLangs}
                  uiLang={uiLang}
                />
              ))}
            </div>
          </div>

          {/* 框架生态板块 */}
          <div id="frameworks" className="scroll-mt-32">
            <h2 className="mb-2 border-b border-zinc-800 pb-2 text-xl font-extrabold text-amber-300">
              {t(UI.frameworksTitle, uiLang)}
            </h2>
            <p className="mb-6 text-sm text-zinc-400">{t(UI.frameworksDesc, uiLang)}</p>
            <FrameworksSection uiLang={uiLang} activeLangs={activeLangs} />
          </div>

          <footer className="border-t border-zinc-800 pt-6 pb-10 text-center text-xs text-zinc-600">
            {t(UI.footer, uiLang)}
          </footer>
        </main>
      </div>

      <FloatNav uiLang={uiLang} sections={navSections} />
    </div>
  );
}
