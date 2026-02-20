import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Target,
  Trophy,
  Flame,
  Youtube,
  FileText,
  Code,
  ArrowDownCircle,
  GraduationCap,
  AlertCircle,
  NotebookTabs,
} from "lucide-react";
import "../styles/StudentDashboard.css";


export default function StudentDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (!stored) {
      navigate("/login");
      return;
    }
    const parsed = JSON.parse(stored);
    if (parsed.role === "admin") {
      navigate("/admin");
      return;
    }
    setUser(parsed);
  }, [navigate]);


  useEffect(() => {
    if (!user) return;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${import.meta.env.VITE_BACKEND_API_BASE}/topic/all`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await res.json();

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("user");
            navigate("/login");
            return;
          }
          throw new Error(result.message || "Failed to load dashboard");
        }

        if (result.isAdmin) {
          navigate("/admin");
          return;
        }

        setDashboardData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user, navigate]);


  const toggleProblem = async (topicId, problemId) => {
    if (!user) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_API_BASE}/topic/toggle`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topicId, problemId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update progress");
      }


      setDashboardData((prev) => {
        if (!prev?.topics) return prev;

        const newTopics = prev.topics.map((topic) => {
          if (topic._id !== topicId) return topic;

          const newProblems = topic.problems.map((p) =>
            p._id === problemId
              ? { ...p, completed: data.completed, completedAt: data.completedAt }
              : p
          );

          const newCompletedCount = newProblems.filter((p) => p.completed).length;

          return {
            ...topic,
            completedCount: newCompletedCount,
            problems: newProblems,
          };
        });

        console.log("newTopics : ", newTopics)

        const newTotalCompleted = newTopics.reduce((sum, t) => sum + t.completedCount, 0);

        return {
          ...prev,
          topics: newTopics,
          totalCompleted: newTotalCompleted,
        };
      });

    }
    catch (err) {
      console.error("Toggle failed:", err);
      alert("Could not update progress. Please try again.");
    }
  };


  const handleLogout = async () => {
    localStorage.removeItem("user");
    navigate("/login");
  };


  const totalProblems = useMemo(
    () => dashboardData?.topics?.reduce((sum, t) => sum + t.totalProblems, 0) ?? 0,
    [dashboardData]
  );

  const completedProblems = dashboardData?.totalCompleted ?? 0;
  const overallPercent = totalProblems ? Math.round((completedProblems / totalProblems) * 100) : 0;

  if (!user) return null;

  return (
    <div className="student-layout">
      <header className="admin-header">
        <div className="header-container">
          <div className="logo-area">
            <div className="logo-icon">
              <NotebookTabs size={20} />
            </div>
            <div>
              <h1>DSA Tracker</h1>
        
            </div>
          </div>

          <div className="user-area">
            <div className="admin-badge">
              <GraduationCap size={14} /> Hi, <strong>{user.username}</strong>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="student-main">
        {loading && (
          <div className="loading-overlay">
            <p>Loading your progress...</p>
          </div>
        )}

        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && dashboardData && (
          <>
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon primary">
                  <Target size={22} />
                </div>
                <div>
                  <div className="stat-label">Total Problems</div>
                  <div className="stat-value">{totalProblems}</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon success">
                  <Trophy size={22} />
                </div>
                <div>
                  <div className="stat-label">Solved</div>
                  <div className="stat-value">
                    {completedProblems} <small>/ {totalProblems}</small>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon accent">
                  <Flame size={22} />
                </div>
                <div>
                  <div className="stat-label">Progress</div>
                  <div className="stat-value accent">{overallPercent}%</div>
                </div>
              </div>
            </div>

            <div className="overall-progress-card">
              <div className="progress-header">
                <span>Overall Completion</span>
                <span>
                  {completedProblems} / {totalProblems}
                </span>
              </div>
              <div className="progress-bar-outer">
                <div
                  className="progress-bar-inner"
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
              <div className="progress-message">
                {overallPercent === 0 && "Start solving problems to track your progress! 🚀"}
                {overallPercent > 0 && overallPercent < 25 && "Great start! Keep going! 💪"}
                {overallPercent >= 25 && overallPercent < 50 && "Solid progress — you're on fire! 🔥"}
                {overallPercent >= 50 && overallPercent < 75 && "Halfway there — amazing work! ⭐"}
                {overallPercent >= 75 && overallPercent < 100 && "Almost done — you're crushing it! 🏆"}
                {overallPercent === 100 && "100% complete — DSA legend! 🎉"}
              </div>
            </div>

            <div className="topics-section">
              <h2>Topics ({dashboardData.topics?.length || 0})</h2>

              <div className="accordion-list">
                {dashboardData.topics?.map((topic) => (
                  <details key={topic._id} className="topic-accordion">
                    <summary className="topic-summary">
                      <div className="topic-info">
                        <span className="topic-title">{topic.title}</span>
                        {topic.description && (
                          <span className="topic-desc">{topic.description}</span>
                        )}
                      </div>
                      <div className="topic-meta">
                        <div className="mini-progress">
                          <div
                            className="mini-progress-fill"
                            style={{ width: `${topic.completedCount / topic.totalProblems * 100 || 0}%` }}
                          />
                        </div>
                        <span className="topic-count">
                          {topic.completedCount} / {topic.totalProblems}
                        </span>
                      </div>
                      <ArrowDownCircle size={18} />
                    </summary>

                    <div className="topic-content">
                      {topic.problems.map((problem) => {
                        const isDone = problem.completed;

                        return (
                          <div
                            key={problem._id}
                            className={`problem-row ${isDone ? "done" : ""}`}
                          >
                            <div className="problem-left">
                              <label className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={isDone}
                                  onChange={() => toggleProblem(topic._id, problem._id)}
                                />
                                <span
                                  className={`problem-title ${isDone ? "strikethrough" : ""}`}
                                >
                                  {problem.title}
                                </span>
                              </label>
                            </div>

                            <div className="problem-difficulty">
                              <span className={`badge ${problem.difficulty.toLowerCase()}`}>
                                {problem.difficulty}
                              </span>
                            </div>

                            <div className="problem-links">
                              {problem.youtubeLink && (
                                <a
                                  href={problem.youtubeLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Watch Explanation"
                                  style={{ color: "#FF0000" }}
                                >
                                  <Youtube size={18} />
                                </a>
                              )}
                              {problem.articleLink && (
                                <a
                                  href={problem.articleLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Read Article"
                                  style={{ color: "#2563EB" }}
                                >
                                  <FileText size={18} />
                                </a>
                              )}
                              {problem.leetcodeLink && (
                                <a
                                  href={problem.leetcodeLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="LeetCode Problem"
                                  style={{ color: "#FFA116" }}
                                >
                                  <Code size={18} />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}