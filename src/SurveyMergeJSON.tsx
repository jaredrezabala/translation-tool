// import { useState } from "react";
// import './App.css';

// interface JSONObject {
//   [key: string]: { [lang: string]: string };
// }

// const SurveyMergeJSON = () => {
//   const [mergedData, setMergedData] = useState<JSONObject>({});
//   const [status, setStatus] = useState<string>("");

//   const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (!files || files.length === 0) return;

//     const tempData: JSONObject = { ...mergedData };
//     let filesProcessed = 0;

//     for (const file of Array.from(files)) {
//       try {
//         const text = await file.text();
//         const json: JSONObject = JSON.parse(text);

//         for (const key in json) {
//           const value = json[key];

//           if (typeof value === "object" && value !== null && !Array.isArray(value)) {
//             if (!tempData[key]) tempData[key] = {};
//             tempData[key] = { ...tempData[key], ...value };
//           }
//         }

//         filesProcessed++;
//       } catch (err) {
//         console.error("❌ Failed to process:", err);
//         setStatus(prev => `${prev}\n❌ Failed to process file: ${file.name}`);
//       }
//     }

//     setMergedData(tempData);
//     setStatus(`✅ Successfully merged ${filesProcessed} file(s).`);
//   };

//   const downloadMerged = () => {
//     const blob = new Blob([JSON.stringify(mergedData, null, 2)], {
//       type: "application/json",
//     });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "survey-merged.json";
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div>
//       <h2>📊 Merge Survey JSON Files</h2>
//       <div>
//         <label>📂 Upload multiple translation JSON files:</label>
//         <input type="file" accept=".json" multiple onChange={handleFiles} />
//       </div>
//       <button style={{ marginTop: "1rem" }} onClick={downloadMerged}>
//         ⬇️ Download Merged File
//       </button>
//       {status && <pre>{status}</pre>}
//     </div>
//   );
// };

// export default SurveyMergeJSON;
import { useState } from "react";
import './App.css';

interface JSONObject {
  [key: string]: { [lang: string]: string };
}

const SurveyMergeJSON = () => {
  const [mergedData, setMergedData] = useState<JSONObject>({});
  const [status, setStatus] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(Array.from(files));
      setStatus(`📁 ${files.length} file(s) selected. Ready to merge.`);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
    setStatus(`📁 ${updatedFiles.length} file(s) remaining.`);
  };

  const mergeSelectedFiles = async () => {
    const tempData: JSONObject = {};
    let filesProcessed = 0;

    for (const file of selectedFiles) {
      try {
        const text = await file.text();
        const json: JSONObject = JSON.parse(text);

        for (const key in json) {
          const value = json[key];

          if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            if (!tempData[key]) tempData[key] = {};
            tempData[key] = { ...tempData[key], ...value };
          }
        }

        filesProcessed++;
      } catch (err) {
        console.error("❌ Failed to process:", err);
        setStatus(prev => `${prev}\n❌ Failed to process file: ${file.name}`);
      }
    }

    setMergedData(tempData);
    setStatus(`✅ Successfully merged ${filesProcessed} file(s).`);
  };

  const downloadMerged = () => {
    const blob = new Blob([JSON.stringify(mergedData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "survey-merged.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2>📊 Merge Survey JSON Files</h2>
      <div>
        <label>📂 Upload multiple translation JSON files:</label>
        <input type="file" accept=".json" multiple onChange={handleFileSelection} />
        <div style={{ marginTop: '1rem' }}>
          {selectedFiles.map((file, index) => (
            <div key={index}>
              {file.name} <button onClick={() => removeFile(index)}>❌ Remove</button>
            </div>
          ))}
        </div>
      </div>
      <button style={{ marginTop: "1rem" }} onClick={mergeSelectedFiles}>
        🔄 Merge Files
      </button>
      <button style={{ marginTop: "1rem", marginLeft: "1rem" }} onClick={downloadMerged}>
        ⬇️ Download Merged File
      </button>
      {status && <pre>{status}</pre>}
    </div>
  );
};

export default SurveyMergeJSON;
