import { useState } from "react";
import './App.css';

type JSONPrimitive = string | number | boolean | null;
type JSONValue = JSONPrimitive | JSONObject | JSONArray;

interface JSONObject {
  [key: string]: JSONValue;
}

type JSONArray = JSONValue[];

type MissingKey = {
  key: string;
  line: number;
  lineContent: string;
};

const SimpleKeyComparer = () => {
  const [baseText, setBaseText] = useState<string>("");
  const [missingKeys, setMissingKeys] = useState<MissingKey[]>([]);
  const [compareKeys, setCompareKeys] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState("");

  const handleBaseFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setBaseText(text);
      setStatus((prev) => prev + "\n✅ Base file loaded.");
    } catch {
      setStatus("❌ Error loading base file.");
    }
  };

  const handleCompareFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const keys = Object.keys(json);
      setCompareKeys(new Set(keys));
      setStatus((prev) => prev + "\n✅ Comparison file loaded.");
    } catch {
      setStatus("❌ Error loading comparison file.");
    }
  };

  const compare = () => {
    if (!baseText || !compareKeys.size) {
      setStatus("❌ Please make sure both files are loaded.");
      return;
    }

    let baseJson: JSONObject;
    try {
      baseJson = JSON.parse(baseText);
    } catch {
      setStatus("❌ Error parsing base JSON.");
      return;
    }

    const lines = baseText.split("\n");
    const result: MissingKey[] = [];
    const seen = new Set<string>();

    for (const key in baseJson) {
      if (!compareKeys.has(key) && !seen.has(key)) {
        seen.add(key);
        const escapedKey = key.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`"${escapedKey}"`);
        const lineIndex = lines.findIndex((line) => regex.test(line));

        result.push({
          key,
          line: lineIndex + 1 || 0,
          lineContent: key,
        });
      }
    }

    setMissingKeys(result);
    setStatus(`✅ Comparison complete. ${result.length} missing key(s).`);
  };

  const downloadMissing = () => {
  const exportObj: Record<string, { "en-US": string }> = {};

  missingKeys.forEach(({ key }) => {
    exportObj[key] = { "en-US": key };
  });

  const json = JSON.stringify(exportObj, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "missing-flat-keys.json";
  a.click();
  URL.revokeObjectURL(url);
};


  return (
    <div>
      <h2>📄 Simple Key Comparator (with line)</h2>

      <div>
        <label>📂 Base file (.json): </label>
        <input type="file" accept=".json" onChange={handleBaseFile} />
      </div>
      <div>
        <label>📂 Flat file to compare: </label>
        <input type="file" accept=".json" onChange={handleCompareFile} />
      </div>

      <button onClick={compare} style={{ marginTop: "1rem" }}>
        🔍 Compare Keys
      </button>

      {status && <p>{status}</p>}

      {missingKeys.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h3>🔑 Missing Keys ({missingKeys.length}):</h3>
          <div style={{ maxHeight: "250px", overflowY: "auto" }}>
            {missingKeys.map((item, i) => (
              <div key={i} style={{ marginBottom: "0.5rem", fontSize: "0.95rem", textAlign: "left"}}>
                <strong>Line {item.line}:</strong> "{item.lineContent}"
              </div>
            ))}
          </div>
          <button onClick={downloadMissing}>⬇️ Download List</button>
        </div>
      )}
    </div>
  );
};

export default SimpleKeyComparer;
