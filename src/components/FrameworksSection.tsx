import { FRAMEWORKS } from '@/data/frameworks';
import { LANGUAGES } from '@/data/types';
import type { LangId } from '@/data/types';
import type { UiLang } from '@/i18n';
import { t } from '@/i18n';
import CodePanel from './CodePanel';

const LABELS = {
  style: { zh: '风格', en: 'Style' },
  bestFor: { zh: '适用', en: 'Best for' },
};

interface Props {
  uiLang: UiLang;
  activeLangs: LangId[];
}

export default function FrameworksSection({ uiLang, activeLangs }: Props) {
  const groups = FRAMEWORKS.filter((g) => activeLangs.includes(g.lang));
  return (
    <div className="space-y-12">
      {groups.map((group) => {
        const meta = LANGUAGES.find((l) => l.id === group.lang)!;
        return (
          <section key={group.lang} id={`fw-${group.lang}`} className="scroll-mt-24">
            <div className="mb-4 flex items-center gap-2.5">
              <span
                className="inline-block h-3.5 w-3.5 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
              <h3 className="text-lg font-bold text-zinc-100">{meta.name}</h3>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                {group.frameworks.length} frameworks
              </span>
            </div>

            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(400px, 100%), 1fr))',
              }}
            >
              {group.frameworks.map((fw) => (
                <div
                  key={fw.name}
                  className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-bold text-zinc-50">{fw.name}</h4>
                      <p className="mt-0.5 text-xs text-zinc-400">{t(fw.tagline, uiLang)}</p>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
                    >
                      {t(fw.tier, uiLang)}
                    </span>
                  </div>

                  <dl className="space-y-1 text-xs leading-relaxed">
                    <div className="flex gap-2">
                      <dt className="shrink-0 font-semibold text-zinc-500">
                        {t(LABELS.style, uiLang)}
                      </dt>
                      <dd className="text-zinc-400">{t(fw.style, uiLang)}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="shrink-0 font-semibold text-zinc-500">
                        {t(LABELS.bestFor, uiLang)}
                      </dt>
                      <dd className="text-zinc-400">{t(fw.bestFor, uiLang)}</dd>
                    </div>
                  </dl>

                  <CodePanel meta={meta} code={fw.code} uiLang={uiLang} />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
