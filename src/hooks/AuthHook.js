import { useAuth } from "../context/AuthContext";

export function useAuthOperations() {
  const { dispatch } = useAuth();

  const handleLogin = (userData) => {
    dispatch({ type: "LOGIN", payload: { user: userData } });
  };

  const handleGoogleLogin = (userData) => {
    dispatch({ type: "LOGIN", payload: { user: userData } });
  };

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
  };

  return { handleLogin, handleLogout, handleGoogleLogin };
}
