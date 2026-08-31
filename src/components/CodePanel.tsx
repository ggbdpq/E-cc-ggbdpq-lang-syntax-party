import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism-tomorrow.css';
import { useState } from 'react';
import type { UiLang } from '@/i18n';
import { UI, t } from '@/i18n';

interface CodeMeta {
  name: string;
  color: string;
  prism: string;
}

interface Props {
  meta: CodeMeta;
  code: string;
  uiLang: UiLang;
}

export default function CodePanel({ meta, code, uiLang }: Props) {
  const [copied, setCopied] = useState(false);
  const html = Prism.highlight(code, Prism.languages[meta.prism], meta.prism);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-[#1d1f21] shadow-lg transition hover:border-zinc-600">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: meta.color }}
          />
          <span className="text-xs font-semibold text-zinc-300">{meta.name}</span>
        </div>
        <button
          onClick={onCopy}
          className="rounded px-1.5 py-0.5 text-[11px] text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
        >
          {copied ? t(UI.copied, uiLang) : t(UI.copy, uiLang)}
        </button>
      </div>
      {/* 自动换行：任何宽度下代码都完整可见，无需横向滚动 */}
      <pre className="!m-0 flex-1 !bg-transparent p-3 text-[12.5px] leading-relaxed">
        <code
          className={`language-${meta.prism}`}
          style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word' }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </pre>
    </div>
  );
}
