import { useState } from "react";
import { Copy, Trash2, Check } from "lucide-react";

export default function ClipItem({ clip, onCopy, onDelete }) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCopy = async () => {
    const result = await onCopy(clip.text);
    if (result.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this clip?")) {
      setDeleting(true);
      await onDelete(clip.id);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 shadow-lg hover:bg-white/15 transition-all group">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-white whitespace-pre-wrap break-words mb-2">
            {clip.text}
          </p>
          <div className="flex items-center gap-3 text-xs text-purple-300">
            <span>{new Date(clip.created_at).toLocaleString()}</span>
            <span className="px-2 py-1 bg-purple-600/30 rounded">
              {clip.source}
            </span>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleCopy}
            className={`p-2 rounded-lg transition-colors ${
              copied
                ? "bg-green-600 text-white"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
            title="Copy to clipboard"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
            title="Delete clip"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
