import type { LangId } from '@/data/types';
import type { UiLang } from '@/i18n';
import { UI } from '@/i18n';
import GuidePage from '@/components/GuidePage';
import { mysqlConnect, mysqlQuery, mysqlAdvanced, mysqlWrite, mysqlCompare } from '@/data/g3-mysql';

interface Props {
  uiLang: UiLang;
  activeLangs: LangId[];
}

export default function MysqlGuide({ uiLang, activeLangs }: Props) {
  const sqlCount =
    mysqlConnect.topics.length +
    mysqlQuery.topics.length +
    mysqlAdvanced.topics.length +
    mysqlWrite.topics.length;
  const stats =
    uiLang === 'zh'
      ? [`${sqlCount} 个 SQL 主题`, `${mysqlCompare.topics.length} 个五语言对照`, '参考《MySQL 必知必会》']
      : [`${sqlCount} SQL topics`, `${mysqlCompare.topics.length} five-language topics`, 'Based on "MySQL Crash Course"'];

  return (
    <GuidePage
      uiLang={uiLang}
      activeLangs={activeLangs}
      heroTitle={UI.mysqlHeroTitle}
      heroDesc={UI.mysqlHeroDesc}
      accent="violet"
      stats={stats}
      categories={[mysqlConnect, mysqlQuery, mysqlAdvanced, mysqlWrite]}
      compareCategories={[mysqlCompare]}
    />
  );
}
