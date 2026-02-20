import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  LogOut,
  Trash2,
  FolderOpen,
  GraduationCap,
  ChevronDown,
  ListChecks,
  Youtube,
  FileText,
  Code,
  ExternalLink,
  NotebookTabs,
} from "lucide-react";
import "../../styles/AdminPanel.css";
import AddTopicForm from "./AddTopicForm";
import AddProblemModal from "./AddProblemModal";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";



export default function AdminPanel() {
  const navigate = useNavigate();

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addProblemOpen, setAddProblemOpen] = useState(false);
  const [problemForm, setProblemForm] = useState({
    topicId: "",
    title: "",
    difficulty: "Easy",
    leetcodeLink: "",
    youtubeLink: "",
    articleLink: "",
    codeforcesLink: "",
  });

  const [showConfirmTopic, setShowConfirmTopic] = useState(null);
  const [showConfirmProblem, setShowConfirmProblem] = useState(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${import.meta.env.VITE_BACKEND_API_BASE}/topic/all`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
  
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("user");
            navigate("/login");
            return;
          }
          throw new Error(data.message || "Failed to load topics");
        }
        setTopics(data.topics || []);
      } catch (err) {
        console.error("Fetch topics error:", err);
        setError(err.message);
        toast.error("Could not load topics");
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [navigate]);

  const totalProblems = topics.reduce((sum, t) => sum + (t.problems?.length || 0), 0);

  const handleAddTopic = async (title, description) => {
    if (!title.trim()) {
      toast.error("Topic title is required");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_API_BASE}/topic`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description?.trim() || "",
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Failed to create topic");

      toast.success("Topic added successfully");
      setTopics((prev) => [...prev, result.data]);
    } catch (err) {
      toast.error(err.message || "Error adding topic");
    }
  };

  const confirmDeleteTopic = async () => {
    if (!showConfirmTopic) return;
    const topicId = showConfirmTopic;

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_API_BASE}/topic/${topicId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to delete topic");
      }

      toast.success("Topic deleted successfully");
      setTopics((prev) => prev.filter((t) => t._id !== topicId));
      setShowConfirmTopic(null);
    } catch (err) {
      toast.error(err.message);
    }
  };


  const handleAddProblem = async (problemData) => {
    const { topicId, title, difficulty, leetcodeLink, youtubeLink, articleLink } = problemData;

    if (!topicId) return toast.error("Please select a topic");
    if (!title.trim()) return toast.error("Problem title is required");


    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_API_BASE}/topic/${topicId}/problem`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          difficulty,
          leetcodeLink: leetcodeLink?.trim() || undefined,
          youtubeLink: youtubeLink?.trim() || undefined,
          articleLink: articleLink?.trim() || undefined,
        }),
      });

      const result = await res.json();
    
      if (!res.ok) throw new Error(result.message || "Failed to add problem");
      toast.success("Problem added successfully");

      setTopics((prev) =>
        prev.map((t) =>
          t._id === topicId
            ? { ...t, problems: [...(t.problems || []), result.data.problems.at(-1)] }
            : t
        )
      );
      setAddProblemOpen(false);
    } catch (err) {
      toast.error(err.message || "Error adding problem");
    }
  };

  const confirmDeleteProblem = async () => {
    if (!showConfirmProblem) return;
    const { topicId, problemId } = showConfirmProblem;

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_API_BASE}/topic/${topicId}/problem/${problemId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to delete problem");
      }

      toast.success("Problem deleted successfully");

      setTopics((prev) =>
        prev.map((t) =>
          t._id === topicId
            ? { ...t, problems: t.problems.filter((p) => p._id !== problemId) }
            : t
        )
      );

      setShowConfirmProblem(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    setTimeout(() => navigate("/login"), 800);
  };



  if (loading) {
    return <div className="admin-layout">Loading admin panel...</div>;
  }

  if (error) {
    return (
      <div className="admin-layout">
        <div style={{ color: "red", padding: "2rem" }}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <header className="admin-header">
        <div className="header-container">
          <div className="logo-area">
            <div className="logo-icon">
              <NotebookTabs size={20} />
            </div>
            <div>
              <h1>Tracker</h1>
            </div>
          </div>

          <div className="user-area">
            <div className="admin-badge">
              <GraduationCap size={14} /> Hi, Admin
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FolderOpen size={22} />
            </div>
            <div>
              <div className="stat-label">Topics</div>
              <div className="stat-value">{topics.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <ListChecks size={22} />
            </div>
            <div>
              <div className="stat-label">Problems</div>
              <div className="stat-value">{totalProblems}</div>
            </div>
          </div>
        </div>

        <div className="tabs-container">
          <div className="tab active">Manage Content</div>

          <div className="tab-content active">
            <AddTopicForm onAddTopic={handleAddTopic} />

            <div className="section-header">
              <h4>
                {topics.length} topic{topics.length !== 1 ? "s" : ""} ·{" "}
                {totalProblems} problem{totalProblems !== 1 ? "s" : ""}
              </h4>
              <button
                className="btn primary small"
                onClick={() => setAddProblemOpen(true)}
              >
                + Add Problem
              </button>
            </div>

            <AddProblemModal
              isOpen={addProblemOpen}
              onClose={() => setAddProblemOpen(false)}
              topics={topics}
              problemForm={problemForm}
              setProblemForm={setProblemForm}
              onAddProblem={handleAddProblem}
            />

            {topics.length === 0 ? (
              <div className="empty-state">
                <FolderOpen size={48} />
                <h3>No topics yet</h3>
                <p>Add your first topic using the form above.</p>
              </div>
            ) : (
              <div className="topics-accordion">
                {topics.map((topic) => (
                  <div key={topic._id} className="topic-accordion-item">
                    <div className="topic-header">
                      <div className="topic-title-area">
                        <h4>{topic.title}</h4>
                        <span className="problem-count">
                          {topic.problems?.length || 0} problem
                          {topic.problems?.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <button
                        className="delete-btn"
                        onClick={() => setShowConfirmTopic(topic._id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <details className="topic-details">
                      <summary>
                        <span>
                          View {topic.problems?.length || 0} problem
                          {topic.problems?.length !== 1 ? "s" : ""}
                        </span>
                        <ChevronDown className="chevron" size={20} />
                      </summary>

                      <div className="topic-problems-list">
                        {(!topic.problems || topic.problems.length === 0) ? (
                          <div className="no-problems">No problems added yet</div>
                        ) : (
                          topic.problems.map((prob) => (
                            <div key={prob._id} className="problem-row">
                              <div className="problem-info">
                                <span className="problem-title">{prob.title}</span>
                                <span
                                  className={`difficulty-badge ${prob.difficulty?.toLowerCase() || "easy"}`}
                                >
                                  {prob.difficulty || "—"}
                                </span>
                              </div>

                              <div className="problem-links">
                                {prob.youtubeLink && (
                                  <a
                                    href={prob.youtubeLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="YouTube Explanation"
                                  >
                                    <Youtube size={18} color="#FF0000" />
                                  </a>
                                )}
                                {prob.articleLink && (
                                  <a
                                    href={prob.articleLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Read Article / Blog"
                                  >
                                    <FileText size={18} color="#2563EB" />
                                  </a>
                                )}
                                {prob.leetcodeLink && (
                                  <a
                                    href={prob.leetcodeLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="LeetCode Problem"
                                  >
                                    <Code size={18} color="#FFA116" />
                                  </a>
                                )}
                                {prob.codeforcesLink && (
                                  <a
                                    href={prob.codeforcesLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Codeforces Problem"
                                  >
                                    <ExternalLink size={18} color="#7C3AED" />
                                  </a>
                                )}
                              </div>

                              <button
                                className="delete-btn small"
                                onClick={() => setShowConfirmProblem({ topicId: topic._id, problemId: prob._id })}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>


      <ConfirmDeleteModal
        isOpen={!!showConfirmTopic}
        onClose={() => setShowConfirmTopic(null)}
        onConfirm={confirmDeleteTopic}
        title="Delete Topic?"
        message="This will permanently delete the topic and all its problems. This action cannot be undone."
        dangerText="Delete Topic"
      />

      <ConfirmDeleteModal
        isOpen={!!showConfirmProblem}
        onClose={() => setShowConfirmProblem(null)}
        onConfirm={confirmDeleteProblem}
        title="Delete Problem?"
        message="This problem will be removed permanently. This action cannot be undone."
        dangerText="Delete Problem"
      />
    </div>
  );
}