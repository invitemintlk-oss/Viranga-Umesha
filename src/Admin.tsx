import React, { useState } from 'react';
import { Link2, Copy, MessageSquareText, Check } from 'lucide-react';
import { PREFIXES, PrefixKey, WEDDING, buildLink, buildMessage, displayName } from './guest';

export default function Admin() {
  const [prefix, setPrefix] = useState<PrefixKey>('mr');
  const [name, setName] = useState('');
  const [result, setResult] = useState<{ display: string; link: string; message: string } | null>(null);
  const [toast, setToast] = useState('');

  const generate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const display = displayName(prefix, name);
    const link = buildLink(window.location.origin, prefix, name);
    setResult({ display, link, message: buildMessage(display, link) });
  };

  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const btn =
    'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="min-h-screen bg-[#f6efe2] text-[#2b2118] font-sans-modern px-4 py-10">
      <div className="max-w-xl mx-auto">
        <h1 className="font-script text-4xl text-center">
          {WEDDING.groomName} &amp; {WEDDING.brideName}
        </h1>
        <p className="text-center text-sm text-[#6b5640] mt-1">Invitation link generator</p>

        <form onSubmit={generate} className="mt-8 bg-white rounded-2xl shadow-sm border border-[#e3d3b4] p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6b5640]">Prefix</span>
              <select
                value={prefix}
                onChange={(e) => setPrefix(e.target.value as PrefixKey)}
                className="mt-1 w-full rounded-lg border border-[#d9c7a3] bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#b8945a]"
              >
                {PREFIXES.map((p) => (
                  <option key={p.key} value={p.key}>{p.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6b5640]">Guest Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sanjaya"
                className="mt-1 w-full rounded-lg border border-[#d9c7a3] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#b8945a]"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button type="submit" disabled={!name.trim()} className={`${btn} bg-[#2b2118] text-[#f3e6cc] hover:bg-[#3d2f20]`}>
              <Link2 className="w-4 h-4" /> Generate Link
            </button>
            <button
              type="button"
              disabled={!result}
              onClick={() => result && copy(result.link, 'Link copied!')}
              className={`${btn} border border-[#2b2118] hover:bg-[#2b2118]/5`}
            >
              <Copy className="w-4 h-4" /> Copy Link Only
            </button>
            <button
              type="button"
              disabled={!result}
              onClick={() => result && copy(result.message, 'Message copied!')}
              className={`${btn} bg-[#25D366] text-white hover:bg-[#1ebe5b]`}
            >
              <MessageSquareText className="w-4 h-4" /> Copy Full Message
            </button>
          </div>
        </form>

        {result && (
          <div className="mt-6 space-y-4">
            <div className="bg-white rounded-2xl border border-[#e3d3b4] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6b5640]">Greeting</p>
              <p className="mt-1 text-lg">Dear {result.display} ❤️</p>

              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#6b5640]">Link</p>
              <a href={result.link} target="_blank" rel="noopener noreferrer" className="mt-1 block break-all text-[#8a5a1c] underline">
                {result.link}
              </a>
            </div>

            <div className="bg-[#dcf8c6] rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#3d6b2a] mb-2">WhatsApp message preview</p>
              <pre className="whitespace-pre-wrap break-words font-sans-modern text-sm leading-relaxed">{result.message}</pre>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-[#2b2118] text-[#f3e6cc] text-sm shadow-lg animate-fadeIn">
          <Check className="w-4 h-4" /> {toast}
        </div>
      )}
    </div>
  );
}
