import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const HELLO_LABS = [
  { lang: 'python', port: 8001, entry: 'labs/hello-api/python-fastapi/main.py' },
  { lang: 'javascript', port: 8002, entry: 'labs/hello-api/node-express/index.js' },
  { lang: 'go', port: 8003, entry: 'labs/hello-api/go-gin/main.go' },
  { lang: 'rust', port: 8004, entry: 'labs/hello-api/rust-axum/src/main.rs' },
  { lang: 'java', port: 8005, entry: 'labs/hello-api/java-springboot/src/main/java/com/example/hello/HelloApplication.java' },
];

const TODO_LABS = [
  { lang: 'python', port: 8011, entry: 'labs/todo-api/python-fastapi/main.py' },
  { lang: 'javascript', port: 8012, entry: 'labs/todo-api/node-express/index.js' },
  { lang: 'go', port: 8013, entry: 'labs/todo-api/go-gin/main.go' },
  { lang: 'rust', port: 8014, entry: 'labs/todo-api/rust-axum/src/main.rs' },
  { lang: 'java', port: 8015, entry: 'labs/todo-api/java-springboot/src/main/java/com/example/todo/TodoApplication.java' },
];

const AUTH_LABS = [
  { lang: 'python', port: 8021, entry: 'labs/auth-todo-api/python-fastapi/main.py' },
  { lang: 'javascript', port: 8022, entry: 'labs/auth-todo-api/node-express/index.js' },
  { lang: 'go', port: 8023, entry: 'labs/auth-todo-api/go-gin/main.go' },
  { lang: 'rust', port: 8024, entry: 'labs/auth-todo-api/rust-axum/src/main.rs' },
  { lang: 'java', port: 8025, entry: 'labs/auth-todo-api/java-springboot/src/main/java/com/example/authtodo/AuthTodoApplication.java' },
];

const ALL_LABS = [...HELLO_LABS, ...TODO_LABS, ...AUTH_LABS];

const missing = ALL_LABS.filter((lab) => !existsSync(join(root, lab.entry)));
const ports = new Set(ALL_LABS.map((lab) => lab.port));

if (missing.length > 0) {
  console.error('missing lab entry files:');
  for (const lab of missing) console.error(`  ${lab.entry}`);
  process.exit(1);
}

if (ports.size !== ALL_LABS.length) {
  console.error('lab ports must be unique');
  process.exit(1);
}

for (const group of [
  ['hello-api', HELLO_LABS],
  ['todo-api', TODO_LABS],
  ['auth-todo-api', AUTH_LABS],
]) {
  const name = group[0];
  const labs = group[1];
  const langs = new Set(labs.map((lab) => lab.lang));
  if (langs.size !== 5) {
    console.error(`expected 5 languages in ${name}`);
    process.exit(1);
  }
}

console.log(
  `ok: ${HELLO_LABS.length} hello-api + ${TODO_LABS.length} todo-api + ${AUTH_LABS.length} auth-todo-api labs`,
);
