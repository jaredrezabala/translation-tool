import { useState } from 'react';
import './App.css';

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

    setStatus("📄 Reading file...");
    const text = await file.text();

    let parsed: TranslationEntry;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("❌ The file is not a valid JSON:", err);
      setStatus("❌ The file is not a valid JSON.");
      return;
    }

    const entries = Object.entries(parsed);
    const chunkSize = 332;
    const totalChunks = Math.ceil(entries.length / chunkSize);

    if (entries.length === 0) {
      setStatus("⚠️ JSON file is empty.");
      return;
    }

    setStatus(`🔧 Splitting into ${totalChunks} file(s)...`);
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
    setStatus("✅ Files ready to download.");
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
      <h2>📚 Split your JSON into chunks of 1000 lines</h2>
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
