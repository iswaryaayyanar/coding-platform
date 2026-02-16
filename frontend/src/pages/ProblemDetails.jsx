// src/pages/ProblemDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import useAuth from "../hooks/useAuth";

const ProblemDetails = () => {
  const { user } = useAuth();
  const { problemId } = useParams();

  const [problem, setProblem] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Resizable panels state
  const [leftWidth, setLeftWidth] = useState(45); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [resultHeight, setResultHeight] = useState(35); // percentage
  const [isResizingResult, setIsResizingResult] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await api.get(`/problems/${problemId}`);
        setProblem(response.data.problem);
        setTestCases(response.data.publicTestCases);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch problem details");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  const handleRun = async () => {
    try {
      const response = await api.post("/run", { code, language });
      setOutput([
        {
          id: 0,
          description: "Custom Run",
          passed: !response.data.output.includes("Error"),
          output: response.data.output,
        },
      ]);
    } catch {
      setOutput([
        { id: 0, description: "Custom Run", passed: false, output: "Error running code" },
      ]);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setOutput([
        {
          id: 0,
          description: "Submission",
          passed: false,
          output: "Code cannot be empty",
        },
      ]);
      return;
    }

    try {
      console.log("Submitting:", {
        userId: user?.id,
        programId: problemId,
        code,
        language,
      });

      const res = await api.post("/submit", {
        userId: user.id,
        programId: problemId,
        code,
        language,
      });

      const { results } = res.data;

      const formatted = results.map((r) => ({
        id: r.testCaseId,
        description: `Test Case ${r.testCaseId}`,
        passed: r.passed,
        output: `Output: ${r.output}\nExpected: ${r.expected}`,
      }));

      setOutput(formatted);
    } catch (err) {
      setOutput([
        {
          id: 0,
          description: "Submission",
          passed: false,
          output: "Error submitting code",
        },
      ]);
    }
  };

  // Handle horizontal resize
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    const container = document.getElementById("main-container");
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    if (newWidth > 25 && newWidth < 75) {
      setLeftWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // Handle vertical resize for results
  const handleResultMouseDown = (e) => {
    setIsResizingResult(true);
    e.preventDefault();
  };

  const handleResultMouseMove = (e) => {
    if (!isResizingResult) return;
    const container = document.getElementById("right-panel");
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const newHeight = ((containerRect.bottom - e.clientY) / containerRect.height) * 100;
    if (newHeight > 15 && newHeight < 70) {
      setResultHeight(newHeight);
    }
  };

  const handleResultMouseUp = () => {
    setIsResizingResult(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    if (isResizingResult) {
      document.addEventListener("mousemove", handleResultMouseMove);
      document.addEventListener("mouseup", handleResultMouseUp);
    } else {
      document.removeEventListener("mousemove", handleResultMouseMove);
      document.removeEventListener("mouseup", handleResultMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleResultMouseMove);
      document.removeEventListener("mouseup", handleResultMouseUp);
    };
  }, [isResizingResult]);

  const difficultyConfig = {
    Easy: { color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)" },
    Medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
    Hard: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" },
  };

  const diff = problem ? difficultyConfig[problem.difficulty] || difficultyConfig["Easy"] : {};

  if (loading)
    return (
      <div style={styles.statusScreen}>
        <div style={styles.spinner} />
        <p style={styles.statusText}>Loading problem...</p>
      </div>
    );
  if (error)
    return (
      <div style={styles.statusScreen}>
        <p style={{ ...styles.statusText, color: "#ef4444" }}>{error}</p>
      </div>
    );
  if (!problem)
    return (
      <div style={styles.statusScreen}>
        <p style={styles.statusText}>Problem not found.</p>
      </div>
    );

  return (
    <>
      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  

  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: #f1f5f9; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

  .problem-page {
     min-height: calc(100vh - 60px);
    height: 100%;
    background: #ffffff;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #1e293b;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .top-bar {
  height: 52px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
  z-index: 10;
  position: sticky;
  top: 0;
}


  .top-bar-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .problem-title-top {
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    max-width: 400px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .difficulty-badge-top {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.03em;
    padding: 4px 12px;
    border-radius: 12px;
  }

  .top-bar-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .lang-select-top {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    color: #0f172a;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 500;
    padding: 6px 32px 6px 12px;
    cursor: pointer;
    outline: none;
    transition: all 0.2s;
  }

  .lang-select-top:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  .lang-select-top:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .btn-top {
    height: 36px;
    padding: 0 16px;
    border: none;
    border-radius: 6px;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
    outline: none;
  }

  .btn-run-top {
    background: #f0f9ff;
    color: #0284c7;
    border: 1px solid #bae6fd;
  }

  .btn-run-top:hover {
    background: #e0f2fe;
    border-color: #7dd3fc;
    transform: translateY(-1px);
  }

  .btn-run-top:active {
    transform: translateY(0);
  }

  .btn-submit-top {
    background: #10b981;
    color: #ffffff;
    border: 1px solid #10b981;
  }

  .btn-submit-top:hover {
    background: #059669;
    border-color: #059669;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  .btn-submit-top:active {
    transform: translateY(0);
  }

  .main-container {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
  }

  .left-panel {
    background: #ffffff;
    border-right: 1px solid #e2e8f0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .right-panel {
    flex: 1;
    background: #ffffff;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .resize-handle {
    width: 4px;
    background: transparent;
    cursor: col-resize;
    position: absolute;
    top: 0;
    bottom: 0;
    right: -2px;
    z-index: 10;
    transition: background 0.2s;
  }

  .resize-handle:hover,
  .resize-handle.resizing {
    background: #3b82f6;
  }

  .resize-handle-horizontal {
    height: 4px;
    width: 100%;
    background: transparent;
    cursor: row-resize;
    position: absolute;
    left: 0;
    right: 0;
    z-index: 10;
    transition: background 0.2s;
  }

  .resize-handle-horizontal:hover,
  .resize-handle-horizontal.resizing {
    background: #3b82f6;
  }

  .panel-header {
    height: 44px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
    flex-shrink: 0;
  }

  .panel-title {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #64748b;
  }

  .panel-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
  }

  .problem-id {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #94a3b8;
    margin-bottom: 8px;
  }

  .problem-title-main {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.4;
    margin-bottom: 20px;
  }

  .difficulty-badge-main {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.03em;
    padding: 4px 12px;
    border-radius: 12px;
    margin-bottom: 20px;
  }

  .problem-description {
    font-size: 14px;
    line-height: 1.7;
    color: #475569;
    white-space: pre-wrap;
    margin-bottom: 32px;
  }

  .section-divider {
    height: 1px;
    background: #e2e8f0;
    margin: 24px 0;
  }

  .section-label {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.03em;
    color: #475569;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .test-case {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 14px 16px;
    margin-bottom: 12px;
    transition: all 0.2s;
  }

  .test-case:hover {
    border-color: #cbd5e1;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .test-case-row {
    display: flex;
    gap: 12px;
    align-items: baseline;
    font-size: 13px;
    margin-bottom: 8px;
  }

  .test-case-row:last-child { margin-bottom: 0; }

  .test-label {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    min-width: 70px;
    flex-shrink: 0;
  }

  .test-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: #0f172a;
    background: #ffffff;
    padding: 4px 10px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
    flex: 1;
  }

  .code-editor-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
  }

  .code-textarea {
    flex: 1;
    width: 100%;
    background: #ffffff;
    border: none;
    border-bottom: 1px solid #e2e8f0;
    color: #0f172a;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    line-height: 1.6;
    padding: 20px;
    resize: none;
    outline: none;
    tab-size: 2;
    overflow-y: auto;
  }

  .code-textarea::placeholder {
    color: #94a3b8;
  }

  .results-section {
    background: #ffffff;
    border-top: 1px solid #e2e8f0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .results-header {
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
    flex-shrink: 0;
  }

  .results-title {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #64748b;
  }

  .results-summary {
    font-size: 12px;
    font-weight: 600;
    color: #0f172a;
  }

  .results-body {
    padding: 16px;
    overflow-y: auto;
    flex: 1;
  }

  .result-card {
    border-radius: 8px;
    padding: 14px 16px;
    margin-bottom: 12px;
    border: 1px solid;
  }

  .result-card.pass {
    background: #f0fdf4;
    border-color: #86efac;
  }

  .result-card.fail {
    background: #fef2f2;
    border-color: #fca5a5;
  }

  .result-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .result-name {
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
  }

  .result-status {
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .result-status.pass { color: #16a34a; }
  .result-status.fail { color: #dc2626; }

  .result-output {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: #475569;
    white-space: pre-wrap;
    line-height: 1.6;
    background: #ffffff;
    padding: 12px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
  }

  .status-screen {
    min-height: 100vh;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', sans-serif;
    gap: 16px;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .status-text {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
  }

  @media (max-width: 1024px) {
    .main-container {
      flex-direction: column;
    }
    .left-panel {
      border-right: none;
      border-bottom: 1px solid #e2e8f0;
    }
    .resize-handle {
      display: none;
    }
  }
`}</style>

      <div className="problem-page">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="top-bar-left">
            <span className="problem-title-top">{problem?.title || "Problem"}</span>
            <span
              className="difficulty-badge-top"
              style={{
                color: diff.color,
                background: diff.bg,
                border: `1px solid ${diff.border}`,
              }}
            >
              {problem?.difficulty}
            </span>
          </div>

          <div className="top-bar-right">
            <select
              className="lang-select-top"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="java">Java</option>
            </select>

            <button className="btn-top btn-run-top" onClick={handleRun}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Run Code
            </button>

            <button className="btn-top btn-submit-top" onClick={handleSubmit}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Submit
            </button>
          </div>
        </div>

        {/* Main Container */}
        <div className="main-container" id="main-container">
          {/* Left Panel - Problem Description */}
          <div className="left-panel" style={{ width: `${leftWidth}%` }}>
            <div
              className={`resize-handle ${isResizing ? 'resizing' : ''}`}
              onMouseDown={handleMouseDown}
            />

            <div className="panel-header">
              <span className="panel-title">Description</span>
            </div>

            <div className="panel-body">
              <p className="problem-id">#{problemId}</p>
              <h1 className="problem-title-main">{problem.title}</h1>
              
              <span
                className="difficulty-badge-main"
                style={{
                  color: diff.color,
                  background: diff.bg,
                  border: `1px solid ${diff.border}`,
                }}
              >
                {problem.difficulty}
              </span>

              <p className="problem-description">{problem.description}</p>

              <div className="section-divider" />

              <div className="section-label">Examples</div>

              {testCases.length === 0 ? (
                <p style={{ fontSize: 13, color: "#64748b", fontStyle: "italic" }}>
                  No public test cases available.
                </p>
              ) : (
                testCases.map((tc) => (
                  <div key={tc.id} className="test-case">
                    <div className="test-case-row">
                      <span className="test-label">Input:</span>
                      <code className="test-value">{tc.input}</code>
                    </div>
                    <div className="test-case-row">
                      <span className="test-label">Output:</span>
                      <code className="test-value">{tc.expected_output}</code>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="right-panel" id="right-panel">
            {/* Code Editor Section */}
            <div className="code-editor-section" style={{ height: output.length > 0 ? `${100 - resultHeight}%` : '100%' }}>
              <div className="panel-header">
                <span className="panel-title">Code</span>
              </div>

              <textarea
                className="code-textarea"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`// Write your ${language} solution here...`}
                spellCheck={false}
              />
            </div>

            {/* Results Section */}
            {output.length > 0 && (
              <div className="results-section" style={{ height: `${resultHeight}%` }}>
                <div
                  className={`resize-handle-horizontal ${isResizingResult ? 'resizing' : ''}`}
                  onMouseDown={handleResultMouseDown}
                  style={{ top: '-2px' }}
                />

                <div className="results-header">
                  <span className="results-title">Test Results</span>
                  <span className="results-summary">
                    {output.filter(o => o.passed).length} / {output.length} Passed
                  </span>
                </div>

                <div className="results-body">
                  {output.map((o) => (
                    <div key={o.id} className={`result-card ${o.passed ? "pass" : "fail"}`}>
                      <div className="result-top">
                        <span className="result-name">{o.description}</span>
                        <span className={`result-status ${o.passed ? "pass" : "fail"}`}>
                          {o.passed ? (
                            <>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Passed
                            </>
                          ) : (
                            <>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                              Failed
                            </>
                          )}
                        </span>
                      </div>
                      <pre className="result-output">{o.output}</pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  statusScreen: {
    minHeight: "100vh",
    background: "#f8fafc",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', sans-serif",
    gap: 16,
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #e2e8f0",
    borderTopColor: "#3b82f6",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  statusText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: 500,
  },
};

export default ProblemDetails;