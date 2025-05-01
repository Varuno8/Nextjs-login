
import { supabase } from '@/integrations/supabase/client';
import { Service, Subscription, FeatureRequest } from '@/lib/types';

// API Configuration
const API_CONFIG = {
  isDevelopment: import.meta.env.DEV,
  supabaseEnabled: true,
  apiBaseUrl: "Supabase PostgreSQL"
};

console.log('API Configuration:', API_CONFIG);

// Auth Service
const authService = {
  // Login with email and password
  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return { success: false, message: error.message };
      }

      // Store the session token in localStorage
      if (data.session) {
        localStorage.setItem('eigengramAccessToken', data.session.access_token);
        console.log('Token stored successfully');
      } else {
        console.error('No session data returned from login');
      }

      return { 
        success: true, 
        data: data.user 
      };
    } catch (error) {
      console.error('Auth service error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  },

  // Google login
  googleLogin: async (token: string) => {
    try {
      // For Supabase, we'd use a different flow, but we'll keep the interface
      // This is a placeholder for now since Google login is handled differently
      return { success: true };
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, message: 'An error occurred with Google login' };
    }
  },

  // Sign up a new user
  signUp: async (userData: any) => {
    try {
      console.log('Signup called with:', userData);
      
      // Validate password
      if (userData.password.length < 8) {
        return { success: false, message: 'Password must be at least 8 characters long' };
      }
      
      if (userData.password !== userData.confirmPassword) {
        return { success: false, message: 'Passwords do not match' };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            username: userData.username,
            phone_number: userData.phoneNumber
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        return { success: false, message: error.message };
      }

      console.log('Signup successful:', data);
      
      // Check if email confirmation is required
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        return { 
          success: false, 
          message: 'This email is already registered. Please use another email or try to log in.' 
        };
      }
      
      return { success: true, data: data.user };
    } catch (error) {
      console.error('Auth service error:', error);
      return { success: false, message: 'An error occurred during signup' };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data.user) {
        return { success: false, message: error?.message || 'No user found' };
      }
      
      // Get additional profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return { success: false, message: profileError.message };
      }
      
      return { 
        success: true, 
        data: {
          id: data.user.id,
          email: data.user.email,
          username: profileData.username,
          name: profileData.name,
          phoneNumber: profileData.phone_number,
          role: profileData.role
        }
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return { success: false, message: 'Error fetching user data' };
    }
  },

  // Update user profile
  updateProfile: async (userData: any) => {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user) {
        return { success: false, message: 'No authenticated user' };
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          phone_number: userData.phoneNumber,
          username: userData.username,
        })
        .eq('id', authUser.user.id)
        .select()
        .single();
        
      if (error) {
        console.error('Update profile error:', error);
        return { success: false, message: error.message };
      }
      
      return { 
        success: true, 
        data: {
          id: data.id,
          email: authUser.user.email,
          username: data.username,
          name: data.name,
          phoneNumber: data.phone_number,
          role: data.role
        }
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'Error updating profile data' };
    }
  },

  // Logout
  logout: async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('eigengramAccessToken');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Error during logout' };
    }
  }
};

// Admin API 
const adminApi = {
  // Get all users
  getAllUsers: async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      return data.map((profile: any) => ({
        id: profile.id,
        username: profile.username,
        email: profile.email,
        name: profile.name || '',
        phoneNumber: profile.phone_number,
        role: profile.role,
        subscriptions: profile.subscriptions_count,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      }));
    } catch (error) {
      console.error('Admin API error:', error);
      return [];
    }
  },

  // Get all subscriptions
  getAllSubscriptions: async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          services:service_id (name, description, price, image_url)
        `);
      
      if (error) {
        console.error('Error fetching subscriptions:', error);
        throw error;
      }
      
      return data.map((sub: any) => ({
        id: sub.id,
        userId: sub.user_id,
        serviceId: sub.service_id,
        status: sub.status,
        startDate: sub.start_date,
        endDate: sub.end_date || '',
        createdAt: sub.created_at,
        updatedAt: sub.updated_at,
        serviceName: sub.services?.name || '',
        userName: sub.profiles?.name || ''
      }));
    } catch (error) {
      console.error('Admin API error:', error);
      return [];
    }
  },

  // Update subscription status
  updateSubscriptionStatus: async (id: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating subscription:', error);
        throw error;
      }
      
      return {
        id: data.id,
        userId: data.user_id,
        serviceId: data.service_id,
        status: data.status,
        startDate: data.start_date,
        endDate: data.end_date || '',
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Admin API error:', error);
      return null;
    }
  },

  // Get all feature requests
  getAllFeatureRequests: async () => {
    try {
      const { data, error } = await supabase
        .from('feature_requests')
        .select(`
          *,
          profiles:user_id (email)
        `);
      
      if (error) {
        console.error('Error fetching feature requests:', error);
        throw error;
      }
      
      return data.map((req: any) => ({
        id: req.id,
        title: req.title,
        description: req.description,
        status: req.status,
        userId: req.user_id,
        userEmail: req.profiles?.email || '',
        submittedAt: req.created_at
      }));
    } catch (error) {
      console.error('Admin API error:', error);
      return [];
    }
  },

  // Update feature request status
  updateFeatureRequestStatus: async (id: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('feature_requests')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating feature request:', error);
        throw error;
      }
      
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        status: data.status,
        userId: data.user_id,
        submittedAt: data.created_at
      };
    } catch (error) {
      console.error('Admin API error:', error);
      return null;
    }
  }
};

// Services API
const servicesApi = {
  // Get all services
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*');
      
      if (error) {
        console.error('Error fetching services:', error);
        return { success: false, message: error.message };
      }
      
      return { 
        success: true, 
        data: data.map((service: any): Service => ({
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price,
          category: service.category || '',
          imageUrl: service.image_url || '',
          awsModelUrl: service.aws_model_url || '',
          isActive: service.is_active,
          createdAt: service.created_at,
          updatedAt: service.updated_at
        }))
      };
    } catch (error) {
      console.error('Services API error:', error);
      return { success: false, message: 'Error fetching services' };
    }
  },

  // Get a specific service by ID
  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching service details:', error);
        return { success: false, message: error.message };
      }
      
      return { 
        success: true, 
        data: {
          id: data.id,
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category || '',
          imageUrl: data.image_url || '',
          awsModelUrl: data.aws_model_url || '',
          isActive: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        } as Service
      };
    } catch (error) {
      console.error('Services API error:', error);
      return { success: false, message: 'Error fetching service details' };
    }
  },

  // Create a new service
  create: async (serviceData: Partial<Service>) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert({
          name: serviceData.name,
          description: serviceData.description,
          price: serviceData.price,
          category: serviceData.category,
          image_url: serviceData.imageUrl,
          aws_model_url: serviceData.awsModelUrl,
          is_active: true
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating service:', error);
        return { success: false, message: error.message };
      }
      
      return { 
        success: true, 
        data: {
          id: data.id,
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category || '',
          imageUrl: data.image_url || '',
          awsModelUrl: data.aws_model_url || '',
          isActive: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        } as Service
      };
    } catch (error) {
      console.error('Services API error:', error);
      return { success: false, message: 'Error creating service' };
    }
  },

  // Update a service
  update: async (id: string, serviceData: Partial<Service>) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .update({
          name: serviceData.name,
          description: serviceData.description,
          price: serviceData.price,
          category: serviceData.category,
          image_url: serviceData.imageUrl,
          aws_model_url: serviceData.awsModelUrl
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating service:', error);
        return { success: false, message: error.message };
      }
      
      return { 
        success: true, 
        data: {
          id: data.id,
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category || '',
          imageUrl: data.image_url || '',
          awsModelUrl: data.aws_model_url || '',
          isActive: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        } as Service
      };
    } catch (error) {
      console.error('Services API error:', error);
      return { success: false, message: 'Error updating service' };
    }
  },

  // Delete a service
  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting service:', error);
        return { success: false, message: error.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Services API error:', error);
      return { success: false, message: 'Error deleting service' };
    }
  }
};

// Subscriptions API
const subscriptionsApi = {
  // Get user subscriptions
  getUserSubscriptions: async (userId: string) => {
    try {
      // Validate userId is a valid UUID before querying
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!UUID_REGEX.test(userId)) {
        console.error('Invalid UUID format for userId:', userId);
        return { success: false, message: 'Invalid user ID format' };
      }
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          services:service_id (name, description, price, image_url)
        `)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching user subscriptions:', error);
        return { success: false, message: error.message };
      }
      
      return { 
        success: true, 
        data: data.map((sub: any): Subscription => ({
          id: sub.id,
          userId: sub.user_id,
          serviceId: sub.service_id,
          status: sub.status,
          startDate: sub.start_date,
          endDate: sub.end_date,
          createdAt: sub.created_at,
          updatedAt: sub.updated_at,
          serviceName: sub.services?.name,
          serviceDescription: sub.services?.description,
          servicePrice: sub.services?.price,
          serviceImageUrl: sub.services?.image_url
        }))
      };
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      return { success: false, message: 'Error fetching subscriptions' };
    }
  },

  // Subscribe to a service
  subscribe: async (serviceId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return { success: false, message: 'Not authenticated' };
      }
      
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userData.user.id,
          service_id: serviceId,
          status: 'PENDING',
          start_date: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating subscription:', error);
        return { success: false, message: error.message };
      }
      
      return { 
        success: true, 
        data: {
          id: data.id,
          userId: data.user_id,
          serviceId: data.service_id,
          status: data.status,
          startDate: data.start_date,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        }
      };
    } catch (error) {
      console.error('Error subscribing to service:', error);
      return { success: false, message: 'Error creating subscription' };
    }
  },

  // Cancel subscription
  cancel: async (subscriptionId: string) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'CANCELLED',
          end_date: new Date().toISOString() 
        })
        .eq('id', subscriptionId)
        .select()
        .single();
      
      if (error) {
        console.error('Error cancelling subscription:', error);
        return { success: false, message: error.message };
      }
      
      return { 
        success: true, 
        data: {
          id: data.id,
          userId: data.user_id,
          serviceId: data.service_id,
          status: data.status,
          startDate: data.start_date,
          endDate: data.end_date,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        }
      };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return { success: false, message: 'Error cancelling subscription' };
    }
  }
};

// Feature Request API
const featureRequestApi = {
  // Submit a new feature request
  submit: async (requestData: { title: string; description: string }) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return { success: false, message: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('feature_requests')
        .insert({
          user_id: userData.user.id,
          title: requestData.title,
          description: requestData.description,
          status: 'NEW'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error submitting feature request:', error);
        return { success: false, message: error.message };
      }
      
      return { 
        success: true, 
        data: {
          id: data.id,
          title: data.title,
          description: data.description,
          status: data.status,
          userId: data.user_id,
          submittedAt: data.created_at
        } as FeatureRequest
      };
    } catch (error) {
      console.error('Error submitting feature request:', error);
      return { success: false, message: 'Error submitting feature request' };
    }
  },

  // Get user's feature requests
  getUserRequests: async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return { success: false, message: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('feature_requests')
        .select('*')
        .eq('user_id', userData.user.id);
      
      if (error) {
        console.error('Error fetching feature requests:', error);
        return { success: false, message: error.message };
      }
      
      return { 
        success: true, 
        data: data.map((req: any): FeatureRequest => ({
          id: req.id,
          title: req.title,
          description: req.description,
          status: req.status,
          userId: req.user_id,
          submittedAt: req.created_at
        }))
      };
    } catch (error) {
      console.error('Error fetching feature requests:', error);
      return { success: false, message: 'Error fetching feature requests' };
    }
  }
};

export { authService, adminApi, servicesApi, subscriptionsApi, featureRequestApi };
export default { authService, adminApi, servicesApi, subscriptionsApi, featureRequestApi };
