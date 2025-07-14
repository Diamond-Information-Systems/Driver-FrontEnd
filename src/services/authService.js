import config from "../config";

// Now includes password in registration
export async function register({
  firstName,
  lastName,
  username,
  email,
  bio,
  password,
}) {
  const response = await fetch(`${config.apiBaseUrl}/api/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName,
      lastName,
      username,
      email,
      bio,
      password,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Registration failed");
  }

  return response.json(); // { user, token }
}

//login function
export async function login({ email, password }, onLoginSuccess) {
  const response = await fetch(`${config.apiBaseUrl}/api/auth/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }

  const data = await response.json();
  
  // Call the callback function instead of using useAuth directly
  if (onLoginSuccess) {
    onLoginSuccess(data);
  }

  return data;
}

//logout function
export async function logout(onLogoutSuccess,token) {

  try {
    
    const response = await fetch(`${config.apiBaseUrl}/api/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
     
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Logout failed");
    }

    // Clear all auth-related storage
    localStorage.removeItem("vaye_token");
    sessionStorage.removeItem("vaye_token");
    localStorage.removeItem("vaye_user");
    sessionStorage.removeItem("vaye_user");

    // Call the success callback if provided
    if (onLogoutSuccess) {
      onLogoutSuccess();
    }

    return response;
  } catch (error) {
    // Even if the API call fails, we should still clear local data
    localStorage.removeItem("vaye_token");
    sessionStorage.removeItem("vaye_token");
    localStorage.removeItem("vaye_user");
    sessionStorage.removeItem("vaye_user");
    
    throw error;
  }
}
