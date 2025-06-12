import { useState } from "react";

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
      console.error("Error al leer el archivo JSON:", err);
      setStatus("❌ Archivo no es un JSON válido.");
      return;
    }

    const localesSet = new Set<string>();
    Object.values(original).forEach((entry) => {
      Object.keys(entry).forEach((locale) => localesSet.add(locale));
    });

    const locales = Array.from(localesSet).sort();
    setAvailableLocales(locales);
    setSelectedLocale(locales[0]);
    setStatus(`✅ Archivo cargado. Selecciona el idioma que deseas extraer.`);
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
    setStatus(`✅ Extracción completada para ${selectedLocale}.`);
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
      <h2>🗂️ Extractor de idioma específico</h2>
      <input type="file" accept=".json" onChange={handleFileChange} />

      {availableLocales.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <label>Selecciona el idioma:</label>
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
            Extraer
          </button>
        </div>
      )}

      {status && <p>{status}</p>}

      {extractedJson && (
        <div>
          <button onClick={downloadExtracted}>⬇️ Descargar JSON extraído</button>
        </div>
      )}
    </div>
  );
};

export default Extractor;
