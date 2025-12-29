import { Search, X } from "lucide-react";

export default function SearchBar({
  searchTerm,
  onSearchChange,
  resultCount,
  totalCount,
}) {
  const handleClear = () => {
    onSearchChange("");
  };

  return (
    <div>
      <Search size={20} />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search clips..."
      />
      {searchTerm && (
        <button onClick={handleClear} title="Clear search">
          <X size={16} />
        </button>
      )}

      <div>
        {searchTerm && (
          <div>
            Found {resultCount} of {totalCount} clip
            {totalCount !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
