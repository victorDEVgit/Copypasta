import { AuthProvider, useAuth } from "./lib/AuthContext";
import Auth from "./pages/Auth";
import { useClips } from "./hooks/UseClips";
import { useState } from "react";
import AddClip from "./components/AddClips";
import ClipItem from "./components/Clipitem";
import { LogOut, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import SearchBar from "./components/SearchBar";

function AppContent() {
  const { user, signOut } = useAuth();
  const {
    clips,
    loading,
    addClip,
    deleteClips,
    copyToClipboard,
    refreshclips,
  } = useClips();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClips = clips.filter((clip) =>
    clip.text.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Sync session with extension
  useEffect(() => {
    if (user) {
      //Get session from Supabase
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          //Send to extension
          chrome.runtime.sendMessage(
            "moopboebkiefggjnjjpmaoldinegnchg",
            {
              type: "SET_SESSION",
              session: session,
            },
            (response) => {
              console.log("Session synced with extension:", response);
            },
          );
        }
      });
    }
  }, [user]);

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Clipboard Manager
            </h1>
            <p className="text-purple-200">Logged in as {user.email}</p>
          </div>

          <div>
            {clips.length > 0 && (
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                resultCount={filteredClips.length}
                totalCount={clips.length}
              />
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={refreshclips}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              title="Refresh clips"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={signOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Add Clip Section */}
        <AddClip onAdd={addClip} />

        {/* Clips List */}
        <div className="space-y-3">
          {loading && clips.length === 0 ? (
            <div className="text-center text-purple-200 py-12">
              <RefreshCw className="animate-spin mx-auto mb-4" size={48} />
              <p>Loading clips...</p>
            </div>
          ) : clips.length === 0 ? (
            <div className="text-center text-purple-200 py-12">
              <p className="text-lg">No clips yet!</p>
              <p className="text-sm mt-2">
                Add your first clip above to get started.
              </p>
            </div>
          ) : filteredClips.length === 0 ? (
            <div className="text-center text-purple-200 py-12">
              <p className="text-lg">No clips match "{searchTerm}"</p>
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 text-purple-400 hover:text-purple-300 underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <>
              <p className="text-purple-200 text-sm mb-4">
                Showing {filteredClips.length}/{clips.length} clip
                {filteredClips.length !== 1 ? "s" : ""}
              </p>
              {filteredClips.map((clip) => (
                <ClipItem
                  key={clip.id}
                  clip={clip}
                  onCopy={copyToClipboard}
                  onDelete={deleteClips}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
