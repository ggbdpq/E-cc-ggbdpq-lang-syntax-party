import type { LangId } from '@/data/types';
import type { UiLang } from '@/i18n';
import { UI } from '@/i18n';
import GuidePage from '@/components/GuidePage';
import { fullstackMindset } from '@/data/g5-fullstack-map';
import { fullstackHttp } from '@/data/g5-fullstack-http';
import { fullstackAuth } from '@/data/g5-fullstack-auth';
import { fullstackData } from '@/data/g5-fullstack-data';
import { fullstackShip } from '@/data/g5-fullstack-ship';

interface Props {
  uiLang: UiLang;
  activeLangs: LangId[];
}

export default function FullstackGuide({ uiLang, activeLangs }: Props) {
  const compare = [fullstackHttp, fullstackAuth, fullstackData, fullstackShip];
  const topicCount = compare.reduce((n, c) => n + c.topics.length, 0);
  const stats =
    uiLang === 'zh'
      ? [
          `${fullstackMindset.topics.length} 张全栈地图`,
          `${compare.length} 层 × ${topicCount} 个五语言主题`,
          '主线：HTTP → 鉴权 → 数据 → 上线',
        ]
      : [
          `${fullstackMindset.topics.length} map topics`,
          `${compare.length} layers × ${topicCount} five-language topics`,
          'spine: HTTP → auth → data → ship',
        ];

  return (
    <GuidePage
      uiLang={uiLang}
      activeLangs={activeLangs}
      heroTitle={UI.fullstackHeroTitle}
      heroDesc={UI.fullstackHeroDesc}
      accent="sky"
      stats={stats}
      categories={[fullstackMindset]}
      compareCategories={compare}
    />
  );
}
