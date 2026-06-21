"use client";

import { useState, useCallback } from "react";
import { DiagnosisResult } from "@/lib/diagnose";

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function BugIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l-1 5M9 14l-2 5M15 14l2 5M12 14a6 6 0 006-6V7a6 6 0 00-12 0v1a6 6 0 006 6zM12 14a6 6 0 01-6-6M12 14a6 6 0 006-6" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

function TerminalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
    >
      {copied ? (
        <CheckIcon className="w-3.5 h-3.5 text-sol-green" />
      ) : (
        <CopyIcon className="w-3.5 h-3.5" />
      )}
      {label ?? (copied ? "Copied" : "Copy")}
    </button>
  );
}

function SectionCard({
  title,
  icon,
  children,
  variant = "default",
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  variant?: "default" | "fix" | "error";
}) {
  const styles = {
    default: "glass glass-hover",
    fix: "border-sol-green/20 bg-sol-green/[0.03]",
    error: "border-red-500/20 bg-red-500/[0.03]",
  };

  return (
    <div className={`rounded-xl border p-5 animate-fade-in-up ${styles[variant]}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gray-500">{icon}</span>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="glass rounded-xl p-4">
      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{label}</p>
      <p className={`text-xl font-mono mt-1 ${accent ?? "text-white"}`}>{value}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="glass glass-hover rounded-xl p-5">
      <div className="w-9 h-9 rounded-lg bg-sol-purple/10 border border-sol-purple/20 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mt-8 space-y-4">
      <div className="h-14 shimmer rounded-xl" />
      <div className="h-28 shimmer rounded-xl" />
      <div className="h-20 shimmer rounded-xl" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-20 shimmer rounded-xl" />
        <div className="h-20 shimmer rounded-xl" />
      </div>
    </div>
  );
}

export default function Home() {
  const [signature, setSignature] = useState("");
  const [network, setNetwork] = useState("mainnet");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signature.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setShowLogs(false);

    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature: signature.trim(), network }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || data.error || "Request failed");
      }

      const data: DiagnosisResult = await response.json();
      setResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; border: string; text: string; glow: string; label: string; icon: React.ReactNode }> = {
      success: {
        bg: "bg-sol-green/[0.08]",
        border: "border-sol-green/30",
        text: "text-sol-green",
        glow: "glow-green",
        label: "Transaction Succeeded",
        icon: <CheckIcon className="w-5 h-5" />,
      },
      failed: {
        bg: "bg-red-500/[0.08]",
        border: "border-red-500/30",
        text: "text-red-400",
        glow: "glow-red",
        label: "Transaction Failed",
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
      },
      not_found: {
        bg: "bg-yellow-500/[0.08]",
        border: "border-yellow-500/30",
        text: "text-yellow-400",
        glow: "",
        label: "Transaction Not Found",
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.876c1.1 0 1.994-.896 1.994-2V7c0-1.104-.894-2-1.994-2H5.062c-1.1 0-1.994.896-1.994 2v10c0 1.104.894 2 1.994 2z" />
          </svg>
        ),
      },
    };
    return configs[status] ?? configs["not_found"];
  };

  const status = result ? getStatusConfig(result.status) : null;

  return (
    <main className="relative min-h-screen z-10">
      {/* Nav */}
      <nav className="border-b border-sol-border/50 backdrop-blur-md sticky top-0 z-50 bg-sol-darker/80">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sol-purple to-sol-green flex items-center justify-center">
              <BugIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">TX Explainer</span>
            <span className="text-[10px] text-gray-600 font-mono px-1.5 py-0.5 rounded border border-sol-border">BETA</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <a
              href="https://github.com/thesithunyein/solana-tx-debugger-skill"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              Skill Repo
            </a>
            <a
              href="https://github.com/solanabr/solana-ai-kit"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              AI Kit
            </a>
          </div>
        </div>
      </nav>

      {/* Hero + Input */}
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-24">
        {/* Hero */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sol-border bg-sol-card/50 text-xs text-gray-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-sol-green animate-pulse-glow" />
            Powered by Solana AI Kit
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            <span className="text-white">Debug any</span>
            <br />
            <span className="gradient-text">Solana transaction</span>
          </h1>
          <p className="text-gray-400 text-base max-w-xl mx-auto leading-relaxed">
            Paste a transaction signature to get an instant human-readable diagnosis,
            root cause analysis, and a concrete fix with code snippets.
          </p>
        </div>

        {/* Input Card */}
        <div className="glass rounded-2xl p-6 glow-purple animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                Transaction Signature
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="5Kj8n2Wp... or full 88-char signature"
                  className="w-full pl-10 pr-4 py-3.5 bg-sol-darker/80 border border-sol-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-sol-purple/50 focus:ring-1 focus:ring-sol-purple/30 transition-all font-mono text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  Network
                </label>
                <div className="flex gap-2">
                  {[
                    { value: "mainnet", label: "Mainnet" },
                    { value: "devnet", label: "Devnet" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setNetwork(opt.value)}
                      disabled={loading}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all border ${
                        network === opt.value
                          ? "border-sol-purple/40 bg-sol-purple/10 text-white"
                          : "border-sol-border bg-sol-darker/50 text-gray-500 hover:text-gray-300 hover:border-sol-border-light"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading || !signature.trim()}
                  className="px-7 py-3.5 bg-gradient-to-r from-sol-purple to-sol-green text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin-slow" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Diagnosing
                    </>
                  ) : (
                    <>
                      <ZapIcon className="w-4 h-4" />
                      Diagnose
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 rounded-xl border border-red-500/30 bg-red-500/[0.08] animate-fade-in-up flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.876c1.1 0 1.994-.896 1.994-2V7c0-1.104-.894-2-1.994-2H5.062c-1.1 0-1.994.896-1.994 2v10c0 1.104.894 2 1.994 2z" />
            </svg>
            <div>
              <p className="text-red-400 text-sm font-semibold">Diagnosis Failed</p>
              <p className="text-gray-400 text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && <LoadingSkeleton />}

        {/* Results */}
        {result && !loading && status && (
          <div className="mt-8 space-y-4">
            {/* Status Banner */}
            <div className={`p-4 rounded-xl border ${status.bg} ${status.border} ${status.glow} animate-fade-in-up flex items-center gap-3`}>
              <span className={status.text}>{status.icon}</span>
              <div className="flex-1">
                <span className={`font-semibold text-sm ${status.text}`}>{status.label}</span>
                <span className="text-gray-500 text-xs ml-2">on {result.network}</span>
              </div>
              <CopyButton text={result.signature} label="Copy sig" />
            </div>

            {/* Error Details */}
            {result.error && (
              <SectionCard title="Error Details" icon={<BugIcon className="w-4 h-4" />} variant="error">
                <div className="space-y-2.5">
                  <div className="flex gap-3 items-center">
                    <span className="text-gray-500 text-xs min-w-[60px] uppercase tracking-wider">Code</span>
                    <code className="text-sol-green text-sm font-mono bg-sol-green/10 px-2 py-0.5 rounded">{result.error.code}</code>
                    <CopyButton text={result.error.code} />
                  </div>
                  <div className="flex gap-3 items-center">
                    <span className="text-gray-500 text-xs min-w-[60px] uppercase tracking-wider">Name</span>
                    <code className="text-white text-sm font-mono">{result.error.name}</code>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="text-gray-500 text-xs min-w-[60px] uppercase tracking-wider mt-0.5">Raw</span>
                    <code className="text-gray-300 text-xs font-mono break-all">{result.error.raw}</code>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Root Cause */}
            {result.rootCause && (
              <SectionCard
                title="Root Cause"
                icon={<SearchIcon className="w-4 h-4" />}
              >
                <p className="text-gray-200 text-sm leading-relaxed">{result.rootCause}</p>
              </SectionCard>
            )}

            {/* Evidence */}
            {result.evidence.length > 0 && (
              <SectionCard
                title="Evidence"
                icon={<TerminalIcon className="w-4 h-4" />}
              >
                <ul className="space-y-2">
                  {result.evidence.map((e, i) => (
                    <li key={i} className="text-xs text-gray-300 font-mono flex gap-2 leading-relaxed">
                      <span className="text-sol-purple shrink-0">›</span>
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* Fix */}
            {result.fix && (
              <SectionCard title="Recommended Fix" icon={<ZapIcon className="w-4 h-4" />} variant="fix">
                <p className="text-gray-200 text-sm leading-relaxed mb-3">{result.fix}</p>
                {result.fixCode && (
                  <div className="relative">
                    <pre className="bg-sol-darker/80 border border-sol-border rounded-lg p-4 overflow-x-auto">
                      <code className="text-xs text-gray-300 font-mono leading-relaxed">{result.fixCode}</code>
                    </pre>
                    <div className="absolute top-2 right-2">
                      <CopyButton text={result.fixCode} />
                    </div>
                  </div>
                )}
              </SectionCard>
            )}

            {/* Prevention */}
            {result.prevention && (
              <SectionCard title="Prevention" icon={<ShieldIcon className="w-4 h-4" />">
                <p className="text-gray-300 text-xs leading-relaxed">{result.prevention}</p>
              </SectionCard>
            )}

            {/* Stats */}
            {(result.computeUnits !== undefined || result.fee !== undefined) && (
              <div className="grid grid-cols-2 gap-4 animate-fade-in-up">
                {result.computeUnits !== undefined && (
                  <StatCard
                    label="Compute Units"
                    value={result.computeUnits.toLocaleString()}
                    accent="text-sol-purple"
                  />
                )}
                {result.fee !== undefined && (
                  <StatCard
                    label="Fee (lamports)"
                    value={result.fee.toLocaleString()}
                    accent="text-sol-green"
                  />
                )}
              </div>
            )}

            {/* Raw Logs */}
            {result.logs && result.logs.length > 0 && (
              <div className="animate-fade-in-up">
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-2 py-2"
                >
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${showLogs ? "rotate-90" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  {showLogs ? "Hide" : "Show"} raw logs ({result.logs.length} lines)
                </button>
                {showLogs && (
                  <pre className="mt-2 p-4 bg-sol-darker/80 border border-sol-border rounded-lg overflow-x-auto max-h-80">
                    <code className="text-[11px] text-gray-500 font-mono whitespace-pre-wrap leading-relaxed">
                      {result.logs.join("\n")}
                    </code>
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        {/* Feature Highlights (when no result) */}
        {!result && !loading && !error && (
          <div className="mt-16 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FeatureCard
                icon={<BugIcon className="w-4 h-4 text-sol-purple" />}
                title="Error Decoding"
                desc="Decodes Anchor, SPL Token, Token-2022, and System program error codes automatically."
              />
              <FeatureCard
                icon={<CodeIcon className="w-4 h-4 text-sol-purple" />}
                title="Fix Recipes"
                desc="22+ real-world error-to-fix recipes with runnable code snippets you can copy."
              />
              <FeatureCard
                icon={<ShieldIcon className="w-4 h-4 text-sol-purple" />}
                title="Prevention"
                desc="Actionable prevention tips so you never hit the same error twice."
              />
            </div>

            {/* How it works */
            <div className="mt-10 glass rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <TerminalIcon className="w-4 h-4 text-sol-purple" />
                How it works
              </h3>
              <div className="space-y-3">
                {[
                  { step: "1", text: "Paste any Solana transaction signature" },
                  { step: "2", text: "We fetch on-chain data and decode the error" },
                  { step: "3", text: "Get root cause, fix, and prevention — instantly" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-sol-purple/10 border border-sol-purple/20 flex items-center justify-center text-xs font-mono text-sol-purple">
                      {item.step}
                    </div>
                    <p className="text-sm text-gray-400">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-sol-border/50 mt-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-sol-purple to-sol-green flex items-center justify-center">
                <BugIcon className="w-3 h-3 text-white" />
              </div>
              <span>TX Explainer — Solana AI Kit Skill</span>
            </div>
            <div className="flex items-center gap-5 text-xs text-gray-600">
              <a
                href="https://github.com/thesithunyein/solana-tx-debugger-skill"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-400 transition-colors"
              >
                Skill
              </a>
              <a
                href="https://github.com/thesithunyein/solana-tx-explainer"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-400 transition-colors"
              >
                Demo Repo
              </a>
              <a
                href="https://github.com/solanabr/solana-ai-kit"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-400 transition-colors"
              >
                AI Kit
              </a>
              <span className="text-gray-700">MIT License</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
