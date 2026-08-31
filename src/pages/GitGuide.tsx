import type { UiLang } from '@/i18n';
import { UI } from '@/i18n';
import GuidePage from '@/components/GuidePage';
import { gitSetup, gitDaily, gitCollab } from '@/data/g2-git';

interface Props {
  uiLang: UiLang;
}

export default function GitGuide({ uiLang }: Props) {
  const topicCount = gitSetup.topics.length + gitDaily.topics.length + gitCollab.topics.length;
  const stats =
    uiLang === 'zh'
      ? [`${topicCount} 个主题`, '命令可直接复制', '参考《GitHub 入门与实践》']
      : [`${topicCount} topics`, 'copy-paste ready commands', 'Based on "GitHub for Beginners"'];

  return (
    <GuidePage
      uiLang={uiLang}
      activeLangs={[]}
      heroTitle={UI.gitHeroTitle}
      heroDesc={UI.gitHeroDesc}
      accent="amber"
      stats={stats}
      categories={[gitSetup, gitDaily, gitCollab]}
    />
  );
}
