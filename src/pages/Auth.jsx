import { useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { Mail, Lock, Chrome } from "lucide-react";

export default function Auth() {
  const [isLogin, setISLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const { signIn, signUp, signInWithGoogle } = useAuth();

  async function checkUserProvider(email) {
    if (!email) return null;
    const { data, error } = await supabase.rpc("get_user_auth_provider", {
      user_email: email,
    });

    if (error) {
      console.error("RPC error checking provider:", error);
      // Decide how to handle RPC errors in your app:
      // return null to proceed with signup, or throw to surface an error.
      throw error;
    }

    // RPC returns: "google", "email", or null (doesn't exist)
    return data;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // safe: user doesn't exist
    const { data, error } = await signUp({ email, password });

    try {
      if (isLogin) {
        // LOGIN flow
        const { error } = await signIn({ email, password });
        if (error) throw error;
        setMessage("Logged in successfully!");
        return;
      }

      // SIGNUP flow: first check provider via RPC
      let provider;
      try {
        provider = await checkUserProvider(email);
      } catch (rpcErr) {
        console.error("Could not verify email provider:", rpcErr);
        setMessage("Unable to verify email. Please try again later.");
        return;
      }

      if (provider === "google") {
        setMessage(
          "This email is already registered with Google. Please sign in with Google.",
        );
        return;
      }

      if (provider === "email") {
        setMessage("Chw");
        return;
      }

      // No provider found -> safe to sign up
      const { data, error } = await signUp({ email, password });

      if (error) {
        // Supabase email-exists errors will surface here for non-OAuth collisions
        if (error.message?.toLowerCase().includes("already registered")) {
          setMessage("This email is already registered. Please sign in.");
          return;
        }
        throw error;
      }

      // NOTE: with email confirmation on, data.user will likely be null — treat lack of error as success
      setMessage("Success! Check your email for a confirmation link.");
    } catch (error) {
      console.error("Authentication error:", error);
      setMessage(error?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error) {
      setMessage(error.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <h1>Clipboard Manager</h1>
        <p>{isLogin ? "Welcome back!" : "Create your account"}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Email</label>
            <div>
              <Mail size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label>Password</label>
            <div>
              <Lock size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {message && <div>{message}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div>
          <div></div>
          <span>or</span>
          <div></div>
        </div>

        <button onClick={handleGoogleSignIn} disabled={loading}>
          <Chrome size={20} />
          Continue with Google
        </button>

        <p>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setISLogin(!isLogin)}>
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
