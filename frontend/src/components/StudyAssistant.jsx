import axios from "axios";
import { useState } from "react";

const SECTIONS = [
  { key: "simple explanation", label: "Simple Explanation", color: "#5DCAA5" },
  { key: "key concepts", label: "Key Concepts", color: "#85B7EB" },
  { key: "examples", label: "Examples", color: "#AFA9EC" },
  { key: "common use cases", label: "Common Use Cases", color: "#F0997B" },
  { key: "practice questions", label: "Practice Questions", color: "#FAC775" },
];

function parseContent(text) {
 
  const clean = text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");

  const sectionIndices = SECTIONS.map(({ key }) => {
    const idx = clean.toLowerCase().search(new RegExp(`\\d?\\.?\\s*${key}`, "i"));
    return idx === -1 ? Infinity : idx;
  });

  const parsed = SECTIONS.map((sec, i) => {
    const start = sectionIndices[i];
    if (start === Infinity) return null;
    const nexts = sectionIndices.filter((_, j) => j !== i && sectionIndices[j] > start);
    const end = nexts.length ? Math.min(...nexts) : clean.length;
    const raw = clean.slice(start, end).trim();
    const content = raw.split("\n").slice(1).join("\n").trim();
    return { ...sec, content };
  }).filter(Boolean);

  return parsed.length > 0 ? parsed : [{ key: "result", label: "Study Guide", color: "#5DCAA5", content: clean }];
}

export default function StudyAssistant() {
  const [topic, setTopic] = useState("");
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStudy = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setSections([]);
    try {
      const response = await axios.post("http://localhost:8000/study", { topic });
      const text = response.data.choices[0].message.content;
      setSections(parseContent(text));
    } catch (err) {
      console.error(err);
      setError("Error contacting backend. Make sure your server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleStudy();
  };

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@400;500&family=DM+Mono:wght@400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #1a1a1a; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        input::placeholder { color: #555; }
        input:focus { outline: none; border-color: #5DCAA5 !important; }
      `}</style>

      <div style={s.card}>

        {/* Header */}
        <div style={s.header}>
          <span style={s.badge}>AI POWERED</span>
          <h1 style={s.title}>CSE Study Assistant</h1>
          <p style={s.subtitle}>Enter any computer science topic and get a structured study guide instantly.</p>
        </div>

        <div style={s.divider} />

        {/* Input row */}
        <div style={s.inputRow}>
          <input
            style={s.input}
            placeholder="Enter a topic — e.g. Binary Search Trees"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKey}
          />
          <button
            onClick={handleStudy}
            disabled={loading || !topic.trim()}
            style={{ ...s.button, ...((loading || !topic.trim()) ? s.buttonDisabled : {}) }}
          >
            {loading
              ? <span style={s.spinner} />
              : "Generate"
            }
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={s.errorBox}>{error}</div>
        )}

        {/* Results */}
        {sections.length > 0 && (
          <div style={s.results}>
            <div style={s.divider} />
            <p style={s.resultsLabel}>Study Guide — {topic}</p>
            {sections.map((sec, i) => (
              <div key={sec.key} style={{ ...s.section, animationDelay: `${i * 0.08}s` }}>
                <div style={s.sectionTop}>
                  <span style={{ ...s.dot, backgroundColor: sec.color }} />
                  <span style={{ ...s.sectionLabel, color: sec.color }}>{sec.label}</span>
                </div>
                <p style={s.sectionContent}>{sec.content}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

const s = {
  page: {
    backgroundColor: "#0e0e0e",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "56px 20px 80px",
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    backgroundColor: "#141414",
    border: "0.5px solid #2a2a2a",
    borderRadius: 16,
    width: "100%",
    maxWidth: 660,
    padding: "40px",
    animation: "fadeUp 0.5s ease",
  },
  header: { textAlign: "center", marginBottom: 28 },
  badge: {
    display: "inline-block",
    fontSize: 10,
    letterSpacing: 2.5,
    fontFamily: "'DM Mono', monospace",
    color: "#5DCAA5",
    backgroundColor: "#0F2820",
    borderRadius: 20,
    padding: "3px 12px",
    marginBottom: 16,
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 36,
    fontWeight: 700,
    color: "#f0f0f0",
    lineHeight: 1.2,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    lineHeight: 1.6,
  },
  divider: {
    borderTop: "0.5px solid #222",
    marginBottom: 24,
  },
  inputRow: {
    display: "flex",
    gap: 10,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    border: "0.5px solid #2e2e2e",
    borderRadius: 8,
    padding: "12px 14px",
    fontSize: 14,
    color: "#e0e0e0",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s",
  },
  button: {
    backgroundColor: "#5DCAA5",
    color: "#0a1f18",
    border: "none",
    borderRadius: 8,
    padding: "12px 22px",
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 96,
    transition: "opacity 0.2s",
  },
  buttonDisabled: {
    opacity: 0.35,
    cursor: "not-allowed",
  },
  spinner: {
    display: "inline-block",
    width: 16,
    height: 16,
    border: "2px solid #0a1f18",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  errorBox: {
    backgroundColor: "#1f0f0f",
    border: "0.5px solid #3d1a1a",
    borderRadius: 8,
    padding: "12px 14px",
    fontSize: 13,
    color: "#e06060",
    fontFamily: "'DM Mono', monospace",
    marginBottom: 16,
  },
  results: {
    animation: "fadeUp 0.4s ease",
  },
  resultsLabel: {
    fontSize: 11,
    fontFamily: "'DM Mono', monospace",
    color: "#444",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  section: {
    backgroundColor: "#1a1a1a",
    border: "0.5px solid #242424",
    borderRadius: 10,
    padding: "16px 18px",
    marginBottom: 10,
    animation: "fadeUp 0.4s ease both",
  },
  sectionTop: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    flexShrink: 0,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  sectionContent: {
    fontSize: 14,
    color: "#aaa",
    lineHeight: 1.8,
    whiteSpace: "pre-wrap",
  },
};