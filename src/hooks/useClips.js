import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/AuthContext";

export function useClips() {
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  //fetch clips from database
  const fetchClips = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("clips")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setClips(data || []);
    } catch (error) {
      console.error("Error fetching clips:", error);
    } finally {
      setLoading(false);
    }
  };

  //Add new clips
  const addClip = async (text) => {
    try {
      const { data, error } = await supabase
        .from("clips")
        .insert([
          {
            text,
            user_id: user.id,
            source: "web",
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;

      //Add to local state immediately
      if (data && data[0]) {
        setClips([data[0], ...clips]);
      }

      return { success: true };
    } catch (error) {
      console.error("Error adding clip:", error);
      return { success: false, error: error.message };
    }
  };

  //Delete clip
  const deleteClips = async (id) => {
    try {
      const { error } = await supabase.from("clips").delete().eq("id", id);

      if (error) throw error;

      //Remove from local state
      setClips(clips.filter((clip) => clip.id !== id));
      return { success: true };
    } catch (error) {
      console.error("Error deleting clips: ", error);
      return { success: false, error: error.message };
    }
  };

  //Copy to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      return { success: false, error: error.message };
    }
  };

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    fetchClips();

    //Subscribe to changes
    const subscription = supabase
      .channel("clips_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "clips",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Real-time updates:", payload);

          if (payload.eventType === "INSERT") {
            setClips((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setClips((prev) =>
              prev.filter((clip) => clip.id !== payload.old.id),
            );
          } else if (payload.eventType === "UPDATE") {
            setClips((prev) =>
              prev.map((clip) =>
                clip.id === payload.new.id ? payload.new : clip,
              ),
            );
          }
        },
      )
      .subscribe();

    return () => {
      subscription.subscribe();
    };
  }, [user]);

  return {
    clips,
    loading,
    addClip,
    deleteClips,
    copyToClipboard,
    refreshclips: fetchClips,
  };
}
