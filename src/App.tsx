import './App.css';
import Nav from './Nav';
import SimpleKeyComparer from './Compare';
import Splitter from './Splitter';
import Cleaner from './Cleaner';
import Extractor from './Extractor';
import KeyComparer from './CompareHardcode';
import { useState } from 'react';

function App() {
  const [currentView, setCurrentView] = useState("home");

  const renderView = () => {
    switch (currentView) {
      case "compare-survey":
        return <SimpleKeyComparer />;
      case "compare-hardcoded":
        return <KeyComparer />;
      case "cleaner":
        return <Cleaner />;
      case "extractor":
        return <Extractor />;
      case "splitter":
        return <Splitter />;
      default:
        return <h2 style={{ textAlign: "center", marginTop: "2rem" }}>👋 Bienvenido. Selecciona una herramienta del menú.</h2>;
    }
  };

  return (
    <>
      <Nav setCurrentView={setCurrentView} />
      {renderView()}
    </>
  );
}

export default App;
