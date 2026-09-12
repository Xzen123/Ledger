import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import GoogleAuthButton from "../components/GoogleAuthButton.jsx";
import RpgHero3D from "../components/RpgHero3D.jsx";
import { SwordIcon } from "../components/Icons.jsx";

export default function Signup() {
  const { signup, googleLogin, status } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (status === "authed") return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await signup(form);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSuccess(payload) {
    setError("");
    try {
      await googleLogin(payload);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden">
      {/* Ambient background illumination */}
      <div className="ambient-glow absolute inset-0 pointer-events-none h-full w-full" aria-hidden="true" />

      {/* 3D Hero Stage (Left Column on desktop, top on mobile) */}
      <div className="relative flex flex-col justify-between p-6 sm:p-10 bg-surface/30 border-b lg:border-b-0 lg:border-r border-hairline/60">
        <div className="relative z-10">
          <span className="font-display text-2xl tracking-tight flex items-center gap-2">
            <SwordIcon className="w-6 h-6 text-amber" />
            <span>Ledger</span>
          </span>
          <p className="text-xs text-mute mt-1">Character Creation Sanctuary</p>
        </div>

        {/* 3D Character Viewport */}
        <div className="w-full my-auto py-4 min-h-[380px] sm:min-h-[460px] flex items-center justify-center">
          <RpgHero3D />
        </div>

        {/* Immersion Quote */}
        <div className="relative z-10 max-w-sm hidden sm:block">
          <p className="font-display text-sm text-ink italic leading-relaxed">
            &ldquo;A hero is forged not in a day of glory, but through thousand small disciplines conquered consistently.&rdquo;
          </p>
          <p className="text-[11px] text-mute uppercase tracking-wider mt-1.5">— Codex of the Living Hero</p>
        </div>
      </div>

      {/* Character Creation Card (Right Column) */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl rpg-glass shadow-lg">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl text-ink">Forge Your Character</h1>
            <p className="text-mute text-xs sm:text-sm mt-1">
              Start at Level 1, claim 25 starting Gold, and embark on your journey.
            </p>
          </div>

          <ErrorBanner message={error} onDismiss={() => setError("")} />

          <div className="mt-4">
            <GoogleAuthButton
              onAuthSuccess={handleGoogleSuccess}
              onError={(msg) => setError(msg)}
              disabled={submitting}
            />

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-hairline" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-surface px-3 text-mute">or register with email</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-mute mb-1 block">Hero Username</span>
              <input
                type="text"
                required
                minLength={3}
                maxLength={20}
                autoComplete="username"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                className="w-full border border-hairline rounded-lg px-3.5 py-2.5 text-sm bg-paper text-ink focus:border-indigo"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-mute mb-1 block">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full border border-hairline rounded-lg px-3.5 py-2.5 text-sm bg-paper text-ink focus:border-indigo"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-mute mb-1 block">Password</span>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full border border-hairline rounded-lg px-3.5 py-2.5 text-sm bg-paper text-ink focus:border-indigo"
              />
              <span className="text-[11px] text-mute mt-1 block">At least 8 characters.</span>
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-ink text-paper rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-60 hover:opacity-90 transition-all shadow-xs"
            >
              {submitting ? "Forging Character…" : "Awaken Character"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-hairline/60 text-center space-y-2">
            <p className="text-xs text-mute">
              Already have a character?{" "}
              <Link to="/login" className="text-indigo hover:text-ink underline underline-offset-2 font-medium">
                Log in
              </Link>
            </p>
            <p className="text-xs">
              <Link to="/landing" className="text-mute hover:text-ink inline-flex items-center gap-1">
                <span>← Explore World Story</span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* commit_stage_32_ayush */
