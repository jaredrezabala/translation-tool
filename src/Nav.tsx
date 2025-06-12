type Props = {
  setCurrentView: (view: string) => void;
};

function Nav({ setCurrentView }: Props) {
  return (
    <nav style={{ display: "flex", gap: "1rem", padding: "1rem", borderBottom: "1px solid #ccc" }}>
      <button onClick={() => setCurrentView("home")}>🏠 Home</button>
      <button onClick={() => setCurrentView("compare-survey")}>📊 Compare Survey Strings</button>
      <button onClick={() => setCurrentView("compare-hardcoded")}>🧩 Compare Hardcoded Strings</button>
      <button onClick={() => setCurrentView("cleaner")}>🧹 JSON Cleaner</button>
      <button onClick={() => setCurrentView("extractor")}>🗂️ JSON Extractor</button>
      <button onClick={() => setCurrentView("splitter")}>✂️ JSON Splitter</button>
    </nav>
  );
}

export default Nav;
