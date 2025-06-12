import { useState } from 'react';

type TranslationEntry = {
  [key: string]: { "en-US": string };
};

type FileChunk = {
  name: string;
  url: string;
};

const Splitter = () => {
  const [status, setStatus] = useState("");
  const [fileChunks, setFileChunks] = useState<FileChunk[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("📄 Leyendo archivo...");
    const text = await file.text();

    let parsed: TranslationEntry;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("❌ Error al leer el JSON:", err);
      setStatus("❌ El archivo no es un JSON válido.");
      return;
    }

    const entries = Object.entries(parsed);
    const chunkSize = 50;
    const totalChunks = Math.ceil(entries.length / chunkSize);

    if (entries.length === 0) {
      setStatus("⚠️ El archivo JSON está vacío.");
      return;
    }

    setStatus(`🔧 Dividiendo en ${totalChunks} archivo(s)...`);
    const chunks: FileChunk[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const chunkEntries = entries.slice(i * chunkSize, (i + 1) * chunkSize);
      const chunkObject = Object.fromEntries(chunkEntries);
      const blob = new Blob([JSON.stringify(chunkObject, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const name = `split-part-${i + 1}.json`;
      chunks.push({ name, url });
    }

    setFileChunks(chunks);
    setStatus("✅ Archivos listos para descargar.");
  };

  const downloadChunk = (chunk: FileChunk) => {
    const a = document.createElement("a");
    a.href = chunk.url;
    a.download = chunk.name;
    a.click();
    URL.revokeObjectURL(chunk.url);
  };

  return (
    <div>
      <h2>📚 Divide tu JSON en bloques de 100 líneas</h2>
      <input type="file" accept=".json" onChange={handleFileChange} />
      {status && <p>{status}</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
        {fileChunks.map((chunk, index) => (
          <button key={index} onClick={() => downloadChunk(chunk)}>
            ⬇️ {chunk.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Splitter;
