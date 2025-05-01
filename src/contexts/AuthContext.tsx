
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { authService } from '../services/api';

// Define response type to match the API
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  phoneNumber?: string;
  image?: string;
  role: 'USER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (userData: SignUpData) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  googleLogin: (token: string) => Promise<boolean>;
}

interface SignUpData {
  username: string;
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from token on initial load
  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        // Check if we have a token
        const token = localStorage.getItem('eigengramAccessToken');
        
        if (token) {
          console.log('Token found in localStorage, attempting to load user');
          // Try to get user data using the token
          const response = await authService.getCurrentUser();
          
          if (response.success && response.data) {
            console.log('User loaded successfully:', response.data);
            setUser(response.data as User);
          } else {
            console.error('Failed to load user with token:', response.message);
            // If token is invalid, clear it
            authService.logout();
          }
        } else {
          console.log('No token found in localStorage');
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Attempting login for:', email);
      
      const response = await authService.login(email, password);
      console.log('Login response:', response);
      
      if (response.success) {
        // Load user data after login
        const userResponse = await authService.getCurrentUser();
        console.log('User data response:', userResponse);
        
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data as User);
          toast.success('Successfully signed in');
          return true;
        } else {
          toast.error(userResponse.message || 'Failed to load user data');
          return false;
        }
      }
      
      toast.error(response.message || 'Invalid email or password');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during sign in');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (token: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await authService.googleLogin(token);
      
      if (response.success) {
        // Load user data after login
        const userResponse = await authService.getCurrentUser();
        
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data as User);
          toast.success('Successfully signed in with Google');
          return true;
        } else {
          toast.error('Failed to load user data');
          return false;
        }
      }
      
      toast.error(response.message || 'Failed to sign in with Google');
      return false;
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('An error occurred during Google sign in');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: SignUpData): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Attempting signup with data:', { ...userData, password: '[REDACTED]' });
      
      const response = await authService.signUp(userData);
      console.log('Signup response:', response);
      
      if (response.success) {
        toast.success('Account created! Please check your email to verify your account before logging in.');
        return true;
      }
      
      toast.error(response.message || 'Registration failed');
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An error occurred during sign up');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    authService.logout();
    toast.success('Successfully signed out');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      authService.updateProfile(userData)
        .then((response) => {
          if (response.success && response.data) {
            setUser({ ...user, ...response.data } as User);
            toast.success('Profile updated successfully');
          } else {
            toast.error(response.message || 'Failed to update profile');
          }
        })
        .catch(() => {
          toast.error('An error occurred while updating your profile');
        });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isAuthenticated: !!user,
      login, 
      signUp,
      logout, 
      updateUser,
      googleLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
