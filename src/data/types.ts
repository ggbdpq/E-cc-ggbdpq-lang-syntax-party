export type LangId = 'python' | 'javascript' | 'java' | 'go' | 'rust';

export interface Bilingual {
  zh: string;
  en: string;
}

export interface Topic {
  id: string;
  title: Bilingual;
  description?: Bilingual;
  /** 难度 1-5，综合案例用；省略则不显示 */
  difficulty?: number;
  snippets: Record<LangId, string>;
}

export interface Category {
  id: string;
  title: Bilingual;
  topics: Topic[];
}

/** 单语言教学主题（JSON / Git / MySQL 等非五语言对比内容） */
export interface GuideTopic {
  id: string;
  title: Bilingual;
  description?: Bilingual;
  /** Prism 高亮语言 */
  lang: string;
  /** 面板展示名，如 SQL / Bash / JSON */
  langLabel: string;
  color: string;
  code: string;
}

export interface GuideCategory {
  id: string;
  title: Bilingual;
  topics: GuideTopic[];
}

/** FloatNav 导航图的分区 */
export interface NavSection {
  id: string;
  title: Bilingual;
  color: string;
  topics: { id: string; title: Bilingual }[];
}

export interface LangMeta {
  id: LangId;
  name: string;
  short: string;
  color: string;
  prism: string;
}

export const LANGUAGES: LangMeta[] = [
  { id: 'python', name: 'Python', short: 'Py', color: '#3776AB', prism: 'python' },
  { id: 'javascript', name: 'Node.js', short: 'JS', color: '#F7DF1E', prism: 'javascript' },
  { id: 'java', name: 'Java', short: 'Java', color: '#ED8B00', prism: 'java' },
  { id: 'go', name: 'Go', short: 'Go', color: '#00ADD8', prism: 'go' },
  { id: 'rust', name: 'Rust', short: 'Rs', color: '#F74C00', prism: 'rust' },
];
