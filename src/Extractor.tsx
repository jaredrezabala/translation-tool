import { useState } from "react";
import './App.css';

const Extractor = () => {
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [availableLocales, setAvailableLocales] = useState<string[]>([]);
  const [selectedLocale, setSelectedLocale] = useState<string>("");
  const [extractedJson, setExtractedJson] = useState<string>("");
  const [status, setStatus] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setJsonFile(file); // ✅ guardar archivo

    const text = await file.text();
    let original: Record<string, Record<string, string>>;

    try {
      original = JSON.parse(text);
    } catch (err) {
      console.error("File is not valid JSON:", err);
      setStatus("❌ File is not valid JSON.");
      return;
    }

    const localesSet = new Set<string>();
    Object.values(original).forEach((entry) => {
      Object.keys(entry).forEach((locale) => localesSet.add(locale));
    });

    const locales = Array.from(localesSet).sort();
    setAvailableLocales(locales);
    setSelectedLocale(locales[0]);
    setStatus(`✅ File loaded. Please select the language you want to extract.`);
  };

  const extractLocale = async () => {
    if (!jsonFile || !selectedLocale) return;

    const text = await jsonFile.text();
    const original = JSON.parse(text);
    const extracted: Record<string, Record<string, string>> = {};

    for (const key in original) {
      if (original[key][selectedLocale]) {
        extracted[key] = {
          [selectedLocale]: original[key][selectedLocale],
        };
      }
    }

    setExtractedJson(JSON.stringify(extracted, null, 2));
    setStatus(`✅ Extraction complete for ${selectedLocale}.`);
  };

  const downloadExtracted = () => {
    const blob = new Blob([extractedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extracted-${selectedLocale}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2>🗂️ Locale Extractor</h2>
      <input type="file" accept=".json" onChange={handleFileChange} />

      {availableLocales.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <label>Select a locale:</label>
          <select
            value={selectedLocale}
            onChange={(e) => setSelectedLocale(e.target.value)}
          >
            {availableLocales.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          <button style={{ marginLeft: "1rem" }} onClick={extractLocale}>
            Extract
          </button>
        </div>
      )}

      {status && <p>{status}</p>}

      {extractedJson && (
        <div>
          <button onClick={downloadExtracted}>⬇️ Download extracted JSON</button>
        </div>
      )}
    </div>
  );
};

export default Extractor;
