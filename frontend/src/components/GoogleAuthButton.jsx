import { useEffect, useRef, useState } from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleAuthButton({ onAuthSuccess, onError, disabled }) {
  const [loading, setLoading] = useState(false);
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);
  const googleBtnContainerRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    // Load Google Identity Services SDK
    if (!window.google?.accounts?.id) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => initGoogle();
      document.head.appendChild(script);
    } else {
      initGoogle();
    }

    function initGoogle() {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });

        if (googleBtnContainerRef.current) {
          googleBtnContainerRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: "outline",
            size: "large",
            width: googleBtnContainerRef.current.offsetWidth || 340,
            text: "continue_with",
            shape: "rectangular",
          });
          setIsGsiLoaded(true);
        }
      } catch (err) {
        console.error("Google Identity initialization error:", err);
      }
    }
  }, []);

  async function handleGoogleResponse(response) {
    if (!response?.credential) {
      onError?.("No Google credential received from account selector.");
      return;
    }
    setLoading(true);
    try {
      await onAuthSuccess({ credential: response.credential });
    } catch (err) {
      onError?.(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleButtonClick() {
    if (!GOOGLE_CLIENT_ID) {
      onError?.(
        "Google Client ID is not configured. Please paste your Client ID into frontend/.env (VITE_GOOGLE_CLIENT_ID) and restart your frontend server."
      );
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  }

  return (
    <div className="w-full">
      {/* Official Google Button container */}
      <div
        ref={googleBtnContainerRef}
        className={`w-full flex justify-center min-h-[44px] ${
          GOOGLE_CLIENT_ID && isGsiLoaded ? "block" : "hidden"
        }`}
      />

      {/* Fallback branded Google button shown when client ID is missing or script is loading */}
      {(!GOOGLE_CLIENT_ID || !isGsiLoaded) && (
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={disabled || loading}
          className="w-full flex items-center justify-center gap-3 border border-hairline bg-surface hover:bg-paper text-ink font-medium text-sm py-2.5 px-4 rounded-md transition-colors shadow-sm disabled:opacity-60"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{loading ? "Verifying Google Account…" : "Continue with Google"}</span>
        </button>
      )}
    </div>
  );
}
