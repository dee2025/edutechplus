"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { LANGUAGES } from "@/utils/languages";

export default function CompilerPage() {
  const [code, setCode] = useState("// Write your code here");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [loading, setLoading] = useState(false);

 const runCode = async () => {
  const res = await fetch("/api/run-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: language.value,
      source_code: code,
    }),
  });

  const data = await res.json();
  setOutput(data.output);
};


  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-4">
        EdutechPlus Online Compiler
      </h1>

      <div className="flex gap-4 mb-4">
        <select
          className="bg-gray-800 p-2 rounded"
          onChange={(e) =>
            setLanguage(LANGUAGES.find(l => l.id == e.target.value))
          }
        >
          {LANGUAGES.map(lang => (
            <option key={lang.id} value={lang.id}>
              {lang.label}
            </option>
          ))}
        </select>

        <button
          onClick={runCode}
          disabled={loading}
          className="bg-green-600 px-4 py-2 rounded"
        >
          {loading ? "Running..." : "Run Code"}
        </button>
      </div>

      <Editor
        height="400px"
        language={language.value}
        theme="vs-dark"
        value={code}
        onChange={value => setCode(value)}
      />

      <div className="mt-4 bg-gray-900 p-4 rounded">
        <h2 className="font-semibold mb-2">Output</h2>
        <pre className="text-green-400 whitespace-pre-wrap">
          {output}
        </pre>
      </div>
    </div>
  );
}
