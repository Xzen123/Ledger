import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [character, setCharacter] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | authed | anon

  const refreshCharacter = useCallback(async () => {
    const data = await api.me();
    setCharacter(data.character);
    return data.character;
  }, []);

  useEffect(() => {
    if (!getToken()) {
      setStatus("anon");
      return;
    }
    refreshCharacter()
      .then(() => setStatus("authed"))
      .catch(() => {
        setToken(null);
        setStatus("anon");
      });
  }, [refreshCharacter]);

  const login = useCallback(async (payload, maybePassword) => {
    const creds =
      typeof payload === "string" ? { username: payload, password: maybePassword } : payload;
    const data = await api.login(creds);
    setToken(data.token);
    setCharacter(data.character);
    setStatus("authed");
  }, []);

  const signup = useCallback(async (payload, maybeEmail, maybePassword) => {
    const body =
      typeof payload === "string"
        ? { username: payload, email: maybeEmail, password: maybePassword }
        : payload;
    const data = await api.signup(body);
    setToken(data.token);
    setCharacter(data.character);
    setStatus("authed");
  }, []);

  const googleLogin = useCallback(async (payload) => {
    const data = await api.googleAuth(payload);
    setToken(data.token);
    setCharacter(data.character);
    setStatus("authed");
    return data.character;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setCharacter(null);
    setStatus("anon");
  }, []);

  return (
    <AuthContext.Provider
      value={{ character, setCharacter, status, login, signup, googleLogin, logout, refreshCharacter }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
