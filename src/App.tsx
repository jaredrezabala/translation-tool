import './App.css'
import Navigation from './Nav'
import SimpleKeyComparer from './Compare'
import Splitter from './Splitter'
import Cleaner from './Cleaner'
import Extractor from './Extractor'
import KeyComparer from './CompareHardcode'
import MergeJSON from './MergeJSON'

import { useState } from 'react'

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
      case "merge-json":
        return <MergeJSON />;
      default:
        return <h2>👋 Welcome. Please select a tool from the menu.</h2>;
    }
  };

  return (
    <>
      <Navigation currentView={currentView} setCurrentView={setCurrentView} />
      <div className="container">
        {renderView()}
      </div>
    </>
  )
}

export default App;
