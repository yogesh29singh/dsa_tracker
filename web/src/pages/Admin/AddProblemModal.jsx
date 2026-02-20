import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import "./AddProblemModal.css";

function AddProblemModal({
  isOpen,
  onClose,
  topics,
  onAddProblem,
}) {
  const [problemForm, setProblemForm] = useState({
    topicId: "",
    title: "",
    difficulty: "Easy",
    leetcodeLink: "",
    youtubeLink: "",
    articleLink: "",
    codeforcesLink: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProblemForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdd = () => {
    if (!problemForm.topicId) {
      toast.error("Please select a topic");
      return;
    }
    if (!problemForm.title.trim()) {
      toast.error("Problem title is required");
      return;
    }

    onAddProblem(problemForm);

    setProblemForm({
      topicId: "",
      title: "",
      difficulty: "Easy",
      leetcodeLink: "",
      youtubeLink: "",
      articleLink: "",
      codeforcesLink: "",
    });

    onClose();
    toast.success("Problem added successfully");
  };

  return (
    <div className="add-overlay">
      <div className="add-modal">
        <div className="add-header">
          <h2>Add New Problem</h2>
          <button className="add-close" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <div className="add-body">
          <div className="add-group">
            <label>Topic *</label>
            <select
              name="topicId"
              value={problemForm.topicId}
              onChange={handleChange}
            >
              <option value="">Select topic</option>
              {topics.map((t) => (
                <option key={t._id || t.id} value={t._id || t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div className="add-group">
            <label>Problem Title *</label>
            <input
              name="title"
              placeholder="e.g. Kth Largest Element in an Array"
              value={problemForm.title}
              onChange={handleChange}
            />
          </div>

          <div className="add-group">
            <label>Difficulty</label>
            <select
              name="difficulty"
              value={problemForm.difficulty}
              onChange={handleChange}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="add-grid">
            <div className="add-group">
              <label>LeetCode</label>
              <input
                name="leetcodeLink"
                type="url"
                placeholder="https://leetcode.com/..."
                value={problemForm.leetcodeLink}
                onChange={handleChange}
              />
            </div>

            <div className="add-group">
              <label>YouTube</label>
              <input
                name="youtubeLink"
                type="url"
                placeholder="https://youtu.be/..."
                value={problemForm.youtubeLink}
                onChange={handleChange}
              />
            </div>

            <div className="add-group">
              <label>Article / Blog</label>
              <input
                name="articleLink"
                type="url"
                placeholder="https://..."
                value={problemForm.articleLink}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="add-actions">
            <button className="add-btn add-cancel" onClick={onClose}>
              Cancel
            </button>
            <button className="add-btn add-primary" onClick={handleAdd}>
              Add Problem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddProblemModal;