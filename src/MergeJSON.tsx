import { useState } from "react";
import './App.css';
import SurveyMergeJSON from './SurveyMergeJSON';


interface JSONObject {
  [key: string]: JSONObject | string | number | boolean | null;
}

const mergeOnlyMissing = (base: JSONObject, insert: JSONObject): JSONObject => {
  const merge = (target: JSONObject, source: JSONObject): void => {
    for (const key in source) {
      const sourceVal = source[key];
      const targetVal = target[key];

      if (
        typeof sourceVal === "object" &&
        sourceVal !== null &&
        !Array.isArray(sourceVal)
      ) {
        if (
          typeof targetVal !== "object" ||
          targetVal === null ||
          Array.isArray(targetVal)
        ) {
          target[key] = {};
        }
        merge(target[key] as JSONObject, sourceVal as JSONObject);
      } else {
        if (!(key in target)) {
          target[key] = sourceVal;
        }
      }
    }
  };

  const result = JSON.parse(JSON.stringify(base)); // Deep clone
  merge(result, insert);
  return result;
};

const MergeJSON = () => {
  const [baseJSON, setBaseJSON] = useState<JSONObject | null>(null);
  const [insertJSON, setInsertJSON] = useState<JSONObject | null>(null);
  const [mergedJSON, setMergedJSON] = useState<string>("");
  const [status, setStatus] = useState("");

  const handleBaseFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const json = JSON.parse(await file.text());
      setBaseJSON(json);
      setStatus("✅ Base file loaded.");
    } catch {
      setStatus("❌ Failed to load base file.");
    }
  };

  const handleInsertFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const json = JSON.parse(await file.text());
      setInsertJSON(json);
      setStatus("✅ File with missing keys loaded.");
    } catch {
      setStatus("❌ Failed to load insertion file.");
    }
  };

  const handleMerge = () => {
    if (!baseJSON || !insertJSON) {
      setStatus("❌ Please load both JSON files.");
      return;
    }

    const merged = mergeOnlyMissing(baseJSON, insertJSON);
    setMergedJSON(JSON.stringify(merged, null, 2));
    setStatus("✅ Merge completed. Only missing keys inserted.");
  };

  const downloadMerged = () => {
    const blob = new Blob([mergedJSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "merged.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <SurveyMergeJSON />
      <h2>🧬 Merge HardCoded JSON Files</h2>
      <div>
        <label>📂 Upload base JSON file:</label>
        <input type="file" accept=".json" onChange={handleBaseFile} />
      </div>
      <div>
        <label>📂 Upload file with missing keys:</label>
        <input type="file" accept=".json" onChange={handleInsertFile} />
      </div>
      <button onClick={handleMerge} style={{ marginTop: "1rem" }}>
        🔄 Merge Files (Insert only missing)
      </button>

      {status && <p>{status}</p>}

      {mergedJSON && (
        <div style={{ marginTop: "1rem" }}>
          <button onClick={downloadMerged}>⬇️ Download Merged File</button>
        </div>
      )}
    </div>
  );
};

export default MergeJSON;
