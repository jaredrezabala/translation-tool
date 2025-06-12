import { useState } from "react";
import './App.css';

type JSONValue = string | number | boolean | JSONObject | Array<JSONValue>;
interface JSONObject { [key: string]: JSONValue }
type MissingKeyResult = { key: string; line: number };

const KeyComparer = () => {
  const [baseText, setBaseText] = useState<string>("");
  const [baseJSON, setBaseJSON] = useState<JSONObject | null>(null);
  const [compareJSON, setCompareJSON] = useState<JSONObject | null>(null);
  const [missingKeys, setMissingKeys] = useState<MissingKeyResult[]>([]);
  const [status, setStatus] = useState("");

  const handleBaseFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      setBaseText(text);
      setBaseJSON(json);
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
      setCompareJSON(json);
      setStatus((prev) => prev + "\n✅ Comparison file loaded.");
    } catch {
      setStatus("❌ Error loading comparison file.");
    }
  };

  const compareKeys = () => {
    if (!baseJSON || !compareJSON) {
      setStatus("❌ Please make sure both JSON files are loaded.");
      return;
    }

    const findMissing = (
      base: JSONValue,
      compare: JSONValue,
      path = ""
    ): string[] => {
      let missing: string[] = [];

      if (typeof base !== "object" || base === null || Array.isArray(base)) {
        return missing;
      }

      const baseObj = base as JSONObject;
      const compareObj =
        compare && typeof compare === "object" && !Array.isArray(compare)
          ? (compare as JSONObject)
          : {};

      for (const key in baseObj) {
        const fullPath = path ? `${path}.${key}` : key;

        if (!(key in compareObj)) {
          missing.push(fullPath);
        } else {
          missing = missing.concat(
            findMissing(baseObj[key], compareObj[key], fullPath)
          );
        }
      }

      return missing;
    };

    const missingPaths = findMissing(baseJSON, compareJSON);
    const lines = baseText.split("\n");

    const missingWithLines: MissingKeyResult[] = missingPaths.map((keyPath) => {
      const parts = keyPath.split(".");
      const lastKey = parts[parts.length - 1];

      // escapamos caracteres especiales
      const escapedKey = lastKey.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`"${escapedKey}"`);
      const lineIndex = lines.findIndex((line) => regex.test(line));

      return {
        key: keyPath,
        line: lineIndex + 1 || 0,
      };
    });

    setMissingKeys(missingWithLines);
    setStatus(`✅ Comparison complete. ${missingWithLines.length} missing key(s).`);
  };

  const downloadMissingKeys = () => {
    const json = JSON.stringify(missingKeys, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "missing-keys.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2>🧩 JSON Key Comparator</h2>
      <div>
        <label>📂 Upload base file: </label>
        <input type="file" accept=".json" onChange={handleBaseFile} />
      </div>
      <div>
        <label>📂 Upload file to compare: </label>
        <input type="file" accept=".json" onChange={handleCompareFile} />
      </div>
      <button style={{ marginTop: "1rem" }} onClick={compareKeys}>
        🔍 Compare Keys
      </button>

      {status && <p>{status}</p>}

      {missingKeys.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h3>🔑 Missing Keys ({missingKeys.length}):</h3>
          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              border: "1px solid #ccc",
              padding: "0.5rem",
              textAlign: "left"
            }}
          >
            {missingKeys.map((item, i) => (
              <div key={i}>
                <strong>Line {item.line}</strong>: {item.key}
              </div>
            ))}
          </div>
          <button onClick={downloadMissingKeys}>⬇️ Download list</button>
        </div>
      )}
    </div>
  );
};

export default KeyComparer;
