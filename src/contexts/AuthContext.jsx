import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { authService } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from token on initial load
  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        // Check if we have a token
        const token = localStorage.getItem("VitalCarePlatformAccessToken");

        if (token) {
          // Try to get user data using the token
          const { success, data } = await authService.getCurrentUser();

          if (success && data) {
            setUser(data);
          } else {
            // If token is invalid, clear it
            authService.logout();
          }
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);

      const { success, message } = await authService.login(email, password);

      if (success) {
        // Load user data after login
        const userResponse = await authService.getCurrentUser();

        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);
          toast.success("Successfully signed in");
          return true;
        } else {
          toast.error("Failed to load user data");
          return false;
        }
      }

      toast.error(message || "Invalid email or password");
      return false;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during sign in");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (token) => {
    try {
      setIsLoading(true);

      const { success, message } = await authService.googleLogin(token);

      if (success) {
        // Load user data after login
        const userResponse = await authService.getCurrentUser();

        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);
          toast.success("Successfully signed in with Google");
          return true;
        } else {
          toast.error("Failed to load user data");
          return false;
        }
      }

      toast.error(message || "Failed to sign in with Google");
      return false;
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("An error occurred during Google sign in");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData) => {
    try {
      setIsLoading(true);

      const { success, message } = await authService.signUp(userData);

      if (success) {
        toast.success(
          "Account created! Please check your email to verify your account before logging in."
        );
        return true;
      }

      toast.error(message || "Registration failed");
      return false;
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An error occurred during sign up");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    authService.logout();
    toast.success("Successfully signed out");
  };

  const updateUser = (userData) => {
    if (user) {
      authService
        .updateProfile(userData)
        .then(({ success, data, message }) => {
          if (success && data) {
            setUser({ ...user, ...data });
            toast.success("Profile updated successfully");
          } else {
            toast.error(message || "Failed to update profile");
          }
        })
        .catch(() => {
          toast.error("An error occurred while updating your profile");
        });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signUp,
        logout,
        updateUser,
        googleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
