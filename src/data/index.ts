import type { Category, LangId } from './types';
import { basics } from './c1-basics';
import { controlFlow } from './c2-control-flow';
import { functions } from './c3-functions';
import { dataStructures } from './c4-data-structures';
import { strings, errorHandling } from './c5-strings-errors';
import { oop } from './c6-oop';
import { concurrency, modules } from './c7-concurrency-modules';
import { advanced } from './c8-advanced';
import { practical } from './c9-practical';
import { capstonePartA } from './c11-capstone-a';
import { capstonePartB } from './c12-capstone-b';
import { commonLogic } from './c13-common-logic';
import { algorithms } from './c14-algorithms';
import { internals } from './c15-internals';

const capstone: Category = {
  id: 'capstone',
  title: { zh: '综合案例', en: 'Capstone Challenges' },
  topics: [...capstonePartA, ...capstonePartB],
};

export const CATEGORIES: Category[] = [
  basics,
  controlFlow,
  functions,
  dataStructures,
  strings,
  errorHandling,
  oop,
  concurrency,
  modules,
  advanced,
  practical,
  capstone,
  commonLogic,
  algorithms,
  internals,
];

export const ALL_LANGS: LangId[] = ['python', 'javascript', 'java', 'go', 'rust'];
