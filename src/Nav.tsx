type Props = {
  currentView: string;
  setCurrentView: (view: string) => void;
};

function Navigation({ currentView, setCurrentView }: Props) {
  const links = [
    { label: "Home", view: "home" },
    { label: "Compare Survey Strings", view: "compare-survey" },
    { label: "Compare HardCoded Strings", view: "compare-hardcoded" },
    { label: "JSON Cleaner", view: "cleaner" },
    { label: "JSON Extractor", view: "extractor" },
    { label: "JSON Splitter", view: "splitter" },
  ];

  return (
    <nav>
      {links.map(({ label, view }) => (
        <a
          key={view}
          href="#"
          onClick={() => setCurrentView(view)}
          className={currentView === view ? "active" : ""}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}

export default Navigation;
