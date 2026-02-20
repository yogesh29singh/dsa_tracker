import { useState } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import "./AddTopicForm.css";

export default function AddTopicForm({ onAddTopic }) {
  const [title, setTitle]       = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      toast.error("Topic title is required");
      return;
    }

    onAddTopic(trimmedTitle, description.trim());

    setTitle("");
    setDescription("");
  };

  return (
    <div className="add-topic-card">
      <h3>
        <Plus size={16} /> Add New Topic
      </h3>

      <div className="add-topic-form">
        <input
          placeholder="e.g. Heaps & Priority Queue"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="Brief description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button className="btn primary" onClick={handleSubmit}>
          <Plus size={16} /> Add Topic
        </button>
      </div>
    </div>
  );
}