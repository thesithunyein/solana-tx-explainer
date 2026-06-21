"use client";

import { useState } from "react";
import { DiagnosisResult } from "@/lib/diagnose";

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

  return (
    <main className="min-h-screen bg-sol-dark">
      {/* Header */}
      <div className="border-b border-sol-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sol-purple to-sol-green flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.876c1.1 0 1.994-.896 1.994-2V7c0-1.104-.894-2-1.994-2H5.062c-1.1 0-1.994.896-1.994 2v10c0 1.104.894 2 1.994 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Solana TX Explainer</h1>
              <p className="text-sm text-gray-400">Paste a transaction signature to diagnose failures</p>
            </div>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Transaction Signature
            </label>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="5Kj8n2Wp... or full signature"
              className="w-full px-4 py-3 bg-sol-card border border-sol-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sol-purple focus:border-transparent font-mono text-sm"
              disabled={loading}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Network
              </label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className="w-full px-4 py-3 bg-sol-card border border-sol-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sol-purple focus:border-transparent"
                disabled={loading}
              >
                <option value="mainnet">Mainnet</option>
                <option value="devnet">Devnet</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading || !signature.trim()}
                className="px-6 py-3 bg-gradient-to-r from-sol-purple to-sol-green text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {loading ? "Diagnosing..." : "Diagnose"}
              </button>
            </div>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-920/20 border border-red-800 rounded-lg">
            <p className="text-red-400 text-sm">
              <span className="font-semibold">Error:</span> {error}
            </p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-6">
            {/* Status Banner */}
            <div
              className={`p-4 rounded-lg border ${
                result.status === "success"
                  ? "bg-sol-green/10 border-sol-green/30"
                  : result.status === "not_found"
                  ? "bg-yellow-920/20 border-yellow-800"
                  : "bg-red-920/20 border-red-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {result.status === "success" && (
                  <svg className="w-5 h-5 text-sol-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {result.status === "failed" && (
                  <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {result.status === "not_found" && (
                  <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.876c1.1 0 1.994-.896 1.994-2V7c0-1.104-.894-2-1.994-2H5.062c-1.1 0-1.994.896-1.994 2v10c0 1.104.894 2 1.994 2z" />
                  </svg>
                )}
                <span
                  className={`font-semibold ${
                    result.status === "success"
                      ? "text-sol-green"
                      : result.status === "not_found"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {result.status === "success"
                    ? "Transaction Succeeded"
                    : result.status === "not_found"
                    ? "Transaction Not Found"
                    : "Transaction Failed"}
                </span>
                <span className="text-gray-500 text-sm">on {result.network}</span>
              </div>
            </div>

            {/* Error Details */}
            {result.error && (
              <div className="p-5 bg-sol-card border border-sol-border rounded-lg">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Error</h2>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <span className="text-gray-500 text-sm min-w-[80px]">Code:</span>
                    <code className="text-sol-green text-sm font-mono">{result.error.code}</code>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-500 text-sm min-w-[80px]">Name:</span>
                    <code className="text-white text-sm font-mono">{result.error.name}</code>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-500 text-sm min-w-[80px]">Raw:</span>
                    <code className="text-gray-300 text-sm font-mono">{result.error.raw}</code>
                  </div>
                </div>
              </div>
            )}

            {/* Root Cause */}
            {result.rootCause && (
              <div className="p-5 bg-sol-card border border-sol-border rounded-lg">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Root Cause</h2>
                <p className="text-gray-200">{result.rootCause}</p>
              </div>
            )}

            {/* Evidence */}
            {result.evidence.length > 0 && (
              <div className="p-5 bg-sol-card border border-sol-border rounded-lg">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Evidence</h2>
                <ul className="space-y-2">
                  {result.evidence.map((e, i) => (
                    <li key={i} className="text-sm text-gray-300 font-mono flex gap-2">
                      <span className="text-sol-purple">›</span>
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Fix */}
            {result.fix && (
              <div className="p-5 bg-sol-green/5 border border-sol-green/20 rounded-lg">
                <h2 className="text-sm font-semibold text-sol-green uppercase tracking-wide mb-3">Fix</h2>
                <p className="text-gray-200 mb-3">{result.fix}</p>
                {result.fixCode && (
                  <pre className="bg-sol-dark border border-sol-border rounded-lg p-4 overflow-x-auto">
                    <code className="text-sm text-gray-300 font-mono">{result.fixCode}</code>
                  </pre>
                )}
              </div>
            )}

            {/* Prevention */}
            {result.prevention && (
              <div className="p-5 bg-sol-card border border-sol-border rounded-lg">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Prevention</h2>
                <p className="text-gray-300 text-sm">{result.prevention}</p>
              </div>
            )}

            {/* Transaction Stats */}
            {(result.computeUnits !== undefined || result.fee !== undefined) && (
              <div className="grid grid-cols-2 gap-4">
                {result.computeUnits !== undefined && (
                  <div className="p-4 bg-sol-card border border-sol-border rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Compute Units</p>
                    <p className="text-lg text-white font-mono mt-1">
                      {result.computeUnits.toLocaleString()}
                    </p>
                  </div>
                )}
                {result.fee !== undefined && (
                  <div className="p-4 bg-sol-card border border-sol-border rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Fee (lamports)</p>
                    <p className="text-lg text-white font-mono mt-1">
                      {result.fee.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Raw Logs Toggle */}
            {result.logs && result.logs.length > 0 && (
              <div>
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className="text-sm text-sol-purple hover:underline flex items-center gap-2"
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${showLogs ? "rotate-90" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  {showLogs ? "Hide" : "Show"} Raw Logs ({result.logs.length} lines)
                </button>
                {showLogs && (
                  <pre className="mt-3 p-4 bg-sol-dark border border-sol-border rounded-lg overflow-x-auto max-h-96">
                    <code className="text-xs text-gray-400 font-mono whitespace-pre-wrap">
                      {result.logs.join("\n")}
                    </code>
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {!result && !loading && !error && (
          <div className="mt-12 text-center text-gray-500 text-sm">
            <p>
              Powered by{" "}
              <a
                href="https://github.com/solanabr/solana-ai-kit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sol-purple hover:underline"
              >
                Solana AI Kit
              </a>{" "}
              — TX Debugger Skill
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
