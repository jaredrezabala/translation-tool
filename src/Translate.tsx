import { useState } from 'react';

const TARGET_LOCALES = [
  "fr-FR", "he-IL", "hi-IN", "hu-HU", "it-IT", "ja-JP", "nl-NL", "pl-PL", "ru-RU",
  "th-TH", "vi-VN", "de-DE", "zh-TW", "zh-CN", "es-ES", "ko-KR", "pt-BR"
];

type Translations = {
  [locale: string]: string;
};

type TranslatedJSON = {
  [key: string]: Translations;
};

const Translate = () => {
  const [translatedJSON, setTranslatedJSON] = useState<TranslatedJSON>({});
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const originalJSON: TranslatedJSON = JSON.parse(text);
    setLoading(true);

    const output: TranslatedJSON = {};

    for (const key in originalJSON) {
      const enText = originalJSON[key]["en-US"];
      const translations: Translations = { "en-US": enText };

      for (const locale of TARGET_LOCALES) {
        const translatedText = await fetchTranslation(enText, locale);
        translations[locale] = translatedText;
      }

      output[key] = translations;
    }

    setTranslatedJSON(output);
    setLoading(false);
  };

  const fetchTranslation = async (text: string, locale: string): Promise<string> => {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo", // Cambiado desde gpt-4
          messages: [
            {
              role: "user",
              content: `Translate the following UI string to ${locale}: "${text}". Only return the translated text.`,
            },
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ API Error:", response.status, errorData);
        return `[ERROR ${locale}]`; // Opcional: para marcar en la salida
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content?.trim();

      return result || `[EMPTY ${locale}]`;
    } catch (error) {
      console.error("⚠️ fetchTranslation error:", error);
      return `[FAILED ${locale}]`;
    }
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(translatedJSON, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "translated.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2>Translate Your JSONs</h2>
      <input type="file" accept=".json" onChange={handleFileChange} />
      {loading && <p>Translating, please wait...</p>}
      {!loading && Object.keys(translatedJSON).length > 0 && (
        <button onClick={downloadJSON}>Download Translated JSON</button>
      )}
    </div>
  );
};

export default Translate;
