import React, { useState } from 'react';
import './Compare.css';

type TranslationMap = Record<string, string>;

const Compare: React.FC = () => {
  const [baseFile, setBaseFile] = useState<TranslationMap | null>(null);
  const [compareFile, setCompareFile] = useState<TranslationMap | null>(null);
  const [missingKeys, setMissingKeys] = useState<TranslationMap>({});
  const [languageLabel, setLanguageLabel] = useState<string>('');

  // 🟡 AÑADE ESTA FUNCIÓN AQUÍ, antes del return
  const syntaxHighlight = (json: string) => {
    if (!json) return '';
    return json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|\b\d+(\.\d+)?\b)/g,
        (match) => {
          let cls = 'number';
          if (/^"/.test(match)) {
            cls = /:$/.test(match) ? 'key' : 'string';
          } else if (/true|false/.test(match)) {
            cls = 'boolean';
          } else if (/null/.test(match)) {
            cls = 'null';
          }
          return `<span class="${cls}">${match}</span>`;
        }
      );
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<TranslationMap | null>>,
    isCompareFile: boolean = false
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setFile(json);
        if (isCompareFile) {
          setLanguageLabel(file.name.replace('.json', ''));
        }
      } catch (err) {
        console.error('Error al leer el archivo JSON:', err);
        alert('Archivo inválido. Asegúrate de que sea un JSON válido.');
      }
    };
    reader.readAsText(file);
  };

  const compareFiles = () => {
    if (!baseFile || !compareFile) {
      alert('Sube ambos archivos para comparar.');
      return;
    }

    const missing: TranslationMap = {};
    for (const key in baseFile) {
      if (!(key in compareFile)) {
        missing[key] = baseFile[key];
      }
    }
    setMissingKeys(missing);
  };

  const downloadMissing = () => {
    const blob = new Blob([JSON.stringify(missingKeys, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `missing_${languageLabel || 'translation'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="compare-container">
      <h2>Comparar archivos de traducción</h2>
      <div>
        <label>Archivo base (en.json):</label>
        <input type="file" accept=".json" onChange={(e) => handleFileUpload(e, setBaseFile)} />
      </div>
      <div>
        <label>Archivo a comparar (es.json, fr.json, etc.):</label>
        <input
          type="file"
          accept=".json"
          onChange={(e) => handleFileUpload(e, setCompareFile, true)}
        />
      </div>
      <div>
        <button onClick={compareFiles}>Comparar archivos</button>
      </div>

      {Object.keys(missingKeys).length > 0 && (
        <div>
          <h3>Claves faltantes en {languageLabel}.json:</h3>
          <div
            className="result-box"
            dangerouslySetInnerHTML={{
              __html: syntaxHighlight(JSON.stringify(missingKeys, null, 2)),
            }}
          />
          <button onClick={downloadMissing}>Descargar JSON faltantes</button>
        </div>
      )}
    </div>
  );
};

export default Compare;
