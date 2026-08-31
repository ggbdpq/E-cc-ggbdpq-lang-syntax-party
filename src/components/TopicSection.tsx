import type { Topic } from '@/data/types';
import { LANGUAGES } from '@/data/types';
import type { LangId } from '@/data/types';
import type { UiLang } from '@/i18n';
import { t } from '@/i18n';
import CodePanel from './CodePanel';

interface Props {
  topic: Topic;
  activeLangs: LangId[];
  uiLang: UiLang;
}

export default function TopicSection({ topic, activeLangs, uiLang }: Props) {
  const metas = LANGUAGES.filter((m) => activeLangs.includes(m.id));
  if (metas.length === 0) return null;

  return (
    <section id={topic.id} className="scroll-mt-32">
      <div className="mb-3">
        <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-100">
          {t(topic.title, uiLang)}
          {topic.difficulty != null && (
            <span className="text-sm tracking-tight" title={`难度 ${topic.difficulty}/5`}>
              <span className="text-amber-400">{'★'.repeat(topic.difficulty)}</span>
              <span className="text-zinc-700">{'★'.repeat(5 - topic.difficulty)}</span>
            </span>
          )}
        </h3>
        {topic.description && (
          <p className="mt-1 text-sm text-zinc-400">{t(topic.description, uiLang)}</p>
        )}
      </div>
      {/* 自适应列宽：卡片不小于 440px，窄屏自动一行一个 */}
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(440px, 100%), 1fr))',
        }}
      >
        {metas.map((meta) => (
          <CodePanel key={meta.id} meta={meta} code={topic.snippets[meta.id]} uiLang={uiLang} />
        ))}
      </div>
    </section>
  );
}
