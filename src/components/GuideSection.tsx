import type { GuideTopic } from '@/data/types';
import type { UiLang } from '@/i18n';
import { t } from '@/i18n';
import CodePanel from './CodePanel';

interface Props {
  topic: GuideTopic;
  uiLang: UiLang;
}

/** 单语言教学主题卡片（JSON / Git / MySQL 等非对比内容） */
export default function GuideSection({ topic, uiLang }: Props) {
  return (
    <section id={topic.id} className="scroll-mt-32">
      <div className="mb-3">
        <h3 className="text-lg font-bold text-zinc-100">{t(topic.title, uiLang)}</h3>
        {topic.description && (
          <p className="mt-1 text-sm leading-relaxed text-zinc-400">{t(topic.description, uiLang)}</p>
        )}
      </div>
      <CodePanel
        meta={{ name: topic.langLabel, color: topic.color, prism: topic.lang }}
        code={topic.code}
        uiLang={uiLang}
      />
    </section>
  );
}
