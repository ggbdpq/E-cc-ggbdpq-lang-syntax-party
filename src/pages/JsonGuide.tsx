import type { LangId } from '@/data/types';
import type { UiLang } from '@/i18n';
import { UI } from '@/i18n';
import GuidePage from '@/components/GuidePage';
import { jsonSyntax, jsonSchemaSecurity, jsonCompare } from '@/data/g1-json';

interface Props {
  uiLang: UiLang;
  activeLangs: LangId[];
}

export default function JsonGuide({ uiLang, activeLangs }: Props) {
  const guideCount = jsonSyntax.topics.length + jsonSchemaSecurity.topics.length;
  const stats =
    uiLang === 'zh'
      ? [`${guideCount} 个语法主题`, `${jsonCompare.topics.length} 个五语言对照`, '参考《JSON 必知必会》']
      : [`${guideCount} syntax topics`, `${jsonCompare.topics.length} five-language topics`, 'Based on "JSON Quick Start"'];

  return (
    <GuidePage
      uiLang={uiLang}
      activeLangs={activeLangs}
      heroTitle={UI.jsonHeroTitle}
      heroDesc={UI.jsonHeroDesc}
      accent="emerald"
      stats={stats}
      categories={[jsonSyntax, jsonSchemaSecurity]}
      compareCategories={[jsonCompare]}
    />
  );
}
