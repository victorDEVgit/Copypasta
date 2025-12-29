import { useState } from "react";
import { Plus } from "lucide-react";

export default function AddClip({ onAdd }) {
  const [text, setText] = useState(" ");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    const result = await onAdd(text);

    if (result.success) {
      setText("");
    }
    setLoading(false);
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch (error) {
      console.error("Failed to read clipboard: ", error);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl mb-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-purple-200 mb-2 text-sm font-semibold">
            Add New Clip
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here... (Ctrl+Enter to save)"
            className="w-full bg-white/20 text-white placeholder-purple-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            rows="4"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                handleSubmit(e);
              }
            }}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus size={18} />
            {loading ? "Saving..." : "Save Clip"}
          </button>

          <button
            type="button"
            onClick={handlePaste}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Paste from Clipboard
          </button>
        </div>
      </form>
    </div>
  );
}
