import type { LangId } from '@/data/types';
import type { UiLang } from '@/i18n';
import { UI } from '@/i18n';
import GuidePage from '@/components/GuidePage';
import {
  AUTH_LABS,
  HELLO_LABS,
  TODO_LABS,
  authRunbook,
  authStartGuide,
  labArchitecture,
  labRunbook,
  labStartGuide,
  todoRunbook,
  todoStartGuide,
} from '@/data/g4-labs';

interface Props {
  uiLang: UiLang;
  activeLangs: LangId[];
}

export default function Labs({ uiLang, activeLangs }: Props) {
  const helloPorts = HELLO_LABS.map((lab) => lab.port).join('/');
  const todoPorts = TODO_LABS.map((lab) => lab.port).join('/');
  const authPorts = AUTH_LABS.map((lab) => lab.port).join('/');
  const stats =
    uiLang === 'zh'
      ? [
          `${HELLO_LABS.length + TODO_LABS.length + AUTH_LABS.length} 个可运行服务`,
          `Hello ${helloPorts} · Todo ${todoPorts} · JWT ${authPorts}`,
          '源码 labs/hello-api/、labs/todo-api/、labs/auth-todo-api/',
        ]
      : [
          `${HELLO_LABS.length + TODO_LABS.length + AUTH_LABS.length} runnable servers`,
          `Hello ${helloPorts} · Todo ${todoPorts} · JWT ${authPorts}`,
          'source: labs/hello-api/, labs/todo-api/, labs/auth-todo-api/',
        ];

  return (
    <GuidePage
      uiLang={uiLang}
      activeLangs={activeLangs}
      heroTitle={UI.labHeroTitle}
      heroDesc={UI.labHeroDesc}
      accent="violet"
      stats={stats}
      categories={[labStartGuide, todoStartGuide, authStartGuide]}
      compareCategories={[labRunbook, todoRunbook, authRunbook, labArchitecture]}
    />
  );
}
