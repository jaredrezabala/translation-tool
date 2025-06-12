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
    const keys = Object.keys(originalJSON);
    const enTexts = keys.map(key => originalJSON[key]["en-US"]);

    // Inicializar con en-US
    keys.forEach((key, i) => {
      output[key] = { "en-US": enTexts[i] };
    });

    for (const locale of TARGET_LOCALES) {
      const translations = await fetchBulkTranslations(enTexts, locale);

      keys.forEach((key, i) => {
        output[key][locale] = translations[enTexts[i]] || `[ERROR ${locale}]`;
      });
    }

    setTranslatedJSON(output);
    setLoading(false);
  };

  const fetchBulkTranslations = async (
    strings: string[],
    locale: string
  ): Promise<Record<string, string>> => {
    const promptObj = strings.reduce((acc, str) => {
      acc[str] = "";
      return acc;
    }, {} as Record<string, string>);

    const prompt = `Translate the following UI strings to ${locale}. Return ONLY a JSON object with the translated values as values:\n\n${JSON.stringify(promptObj, null, 2)}`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`❌ Error ${response.status}:`, errorData);
        return {};
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) throw new Error("Empty response from OpenAI");

      return JSON.parse(content);
    } catch (err) {
      console.error(`⚠️ Failed to translate to ${locale}`, err);
      return {};
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
