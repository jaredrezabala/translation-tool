import { useState } from "react";
import './App.css';

type CleanResult = {
    key: string;
    value: string;
    line: number;
};

const Cleaner = () => {
    const [status, setStatus] = useState("");
    const [deleted, setDeleted] = useState<CleanResult[]>([]);
    const [cleanedJson, setCleanedJson] = useState<string>("");

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const text = await file.text();
        const lines = text.split("\n");
        let original: Record<string, { "en-US": string }> = {};

        try {
            original = JSON.parse(text);
        } catch (err) {
            console.error("Error: Invalid JSON file:", err);
            setStatus("❌ Error: Invalid JSON file.");
            return;
        }

        const deletedItems: CleanResult[] = [];
        const cleaned: Record<string, { "en-US": string }> = {};

        // Funciones de validación robustas
        const isOnlyAngleBrackets = (str: unknown) =>
            /^<[^<>]+>$/.test(String(str).trim());

        const isOnlyNumbers = (str: unknown) =>
            /^\d+$/.test(String(str).trim());

        const isOnlySymbols = (str: unknown) =>
            /^[^a-zA-Z0-9]+$/.test(String(str).trim());

        const isCodePattern = (str: unknown) =>
            /\b(AA|UU)[#*]+(\s+or\s+(AA|UU)[#*]+)*\b/i.test(String(str).trim());

        const isMaskedPattern = (str: unknown) =>
            /[#*]{3,}([-–][#*]{3,})*/.test(String(str)) || /[#*]{3,}.*[#*]{3,}/.test(String(str));

        const isRawPercentOrRange = (str: unknown) => {
            const s = String(str).trim();
            return (
                /^\d+%$/.test(s) || // solo porcentaje como "3%"
                /^[<>]?[\d.kKmM\s-]+$/.test(s) // solo rango como "<1M", "500k - 1M"
            );
        };

        const containsUrl = (str: unknown) =>
            /(https?:\/\/[^\s)]+)/.test(String(str));

        const containsMarkdownLink = (str: unknown) =>
            /\[[^\]]+\]\([^)]+\)/.test(String(str));

        const containsLegalRef = (str: unknown) =>
            /\b(NJ|PA|REV|IRS|W8|W9)[-_]?\d{2,}/i.test(String(str));



        for (const [key, valueObj] of Object.entries(original)) {
            const val = valueObj["en-US"];

            const shouldDelete =
                !containsUrl(key) &&
                !containsMarkdownLink(key) &&
                !containsLegalRef(key) &&
                (
                    isOnlyNumbers(key) ||
                    isOnlyNumbers(val) ||
                    isOnlySymbols(key) ||
                    isOnlySymbols(val) ||
                    isCodePattern(key) ||
                    isCodePattern(val) ||
                    isOnlyAngleBrackets(key) ||
                    isOnlyAngleBrackets(val) ||
                    isRawPercentOrRange(val) ||
                    isMaskedPattern(key) ||
                    isMaskedPattern(val)
                );


            if (shouldDelete) {
                const regex = new RegExp(
                    `"${key.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&")}"`
                );
                const lineIndex = lines.findIndex((line) => regex.test(line));
                deletedItems.push({
                    key,
                    value: String(val),
                    line: lineIndex + 1 || 0,
                });
            } else {
                cleaned[key] = valueObj;
            }
        }

        setDeleted(deletedItems);
        setCleanedJson(JSON.stringify(cleaned, null, 2));
        setStatus(`✅ Cleaned: ${deletedItems.length} entries removed.`);
    };

    const downloadCleanedJSON = () => {
        const blob = new Blob([cleanedJson], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "cleaned.json";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <h2>🧹 Cleaner de JSON</h2>
            <input type="file" accept=".json" onChange={handleFileChange} />
            {status && <p>{status}</p>}

            {cleanedJson && (
                <button onClick={downloadCleanedJSON}>
                    ⬇️ Download cleaned JSON
                </button>
            )}

            {deleted.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                    <h3>🗑️ Removed Entries ({deleted.length}):</h3>
                    <div
                        style={{
                            maxHeight: "250px",
                            overflowY: "auto",
                            border: "1px solid #ccc",
                            padding: "0.5rem",
                            textAlign: "left",
                        }}
                    >
                        {deleted.map((item, i) => (
                            <div key={i}>
                                <strong>Line {item.line}</strong>: "{item.key}" → "
                                {item.value}"
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cleaner;
