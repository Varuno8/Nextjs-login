import { supabase } from '@/integrations/supabase/client';
import { Service, User, Subscription, FeatureRequest } from './types';
import { v4 as uuidv4 } from 'uuid';

// Type mapping helpers
const mapDbServiceToService = (dbService: any): Service => ({
  id: dbService.id,
  name: dbService.name,
  description: dbService.description,
  price: Number(dbService.price),
  isActive: dbService.is_active,
  createdAt: dbService.created_at,
  updatedAt: dbService.updated_at,
  category: dbService.category,
  imageUrl: dbService.image_url,
  awsModelUrl: dbService.aws_model_url
});

const mapDbProfileToUser = (dbProfile: any): User => ({
  id: dbProfile.id,
  username: dbProfile.username,
  email: dbProfile.email,
  name: dbProfile.name || '',
  phoneNumber: dbProfile.phone_number,
  role: dbProfile.role as 'USER' | 'ADMIN',
  subscriptions: dbProfile.subscriptions_count,
  createdAt: dbProfile.created_at,
  updatedAt: dbProfile.updated_at
});

const mapDbSubscriptionToSubscription = (dbSubscription: any): Subscription => ({
  id: dbSubscription.id,
  userId: dbSubscription.user_id,
  serviceId: dbSubscription.service_id,
  status: dbSubscription.status as 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'CANCELLED',
  startDate: dbSubscription.start_date,
  endDate: dbSubscription.end_date,
  createdAt: dbSubscription.created_at,
  updatedAt: dbSubscription.updated_at,
  serviceName: dbSubscription.serviceName,
  userName: dbSubscription.userName
});

const mapDbFeatureRequestToFeatureRequest = (dbRequest: any): FeatureRequest => ({
  id: dbRequest.id,
  title: dbRequest.title,
  description: dbRequest.description,
  status: dbRequest.status as 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED',
  userId: dbRequest.user_id,
  userEmail: dbRequest.userEmail,
  submittedAt: dbRequest.created_at
});

// Get current user ID from Supabase auth
export const getCurrentUserId = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getUser();
  return data.user?.id || null;
};

// Get current user email from Supabase auth
export const getCurrentUserEmail = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getUser();
  return data.user?.email || null;
};

// Service Functions
export const getServices = async (): Promise<Service[]> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching services:', error);
      return [];
    }
    
    return data.map(mapDbServiceToService);
  } catch (err) {
    console.error('Error in getServices:', err);
    return [];
  }
};

export const getService = async (id: string): Promise<Service | null> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      console.error('Error fetching service:', error);
      return null;
    }
    
    return mapDbServiceToService(data);
  } catch (err) {
    console.error('Error in getService:', err);
    return null;
  }
};

export const addService = async (serviceData: Partial<Service>): Promise<Service | null> => {
  try {
    const dbService = {
      name: serviceData.name,
      description: serviceData.description,
      price: serviceData.price,
      is_active: serviceData.isActive !== undefined ? serviceData.isActive : true,
      category: serviceData.category,
      image_url: serviceData.imageUrl,
      aws_model_url: serviceData.awsModelUrl
    };
    
    const { data, error } = await supabase
      .from('services')
      .insert([dbService])
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error adding service:', error);
      return null;
    }
    
    return mapDbServiceToService(data);
  } catch (err) {
    console.error('Error in addService:', err);
    return null;
  }
};

export const updateService = async (id: string, serviceData: Partial<Service>): Promise<Service | null> => {
  try {
    const dbService: any = {};
    if (serviceData.name !== undefined) dbService.name = serviceData.name;
    if (serviceData.description !== undefined) dbService.description = serviceData.description;
    if (serviceData.price !== undefined) dbService.price = serviceData.price;
    if (serviceData.isActive !== undefined) dbService.is_active = serviceData.isActive;
    if (serviceData.category !== undefined) dbService.category = serviceData.category;
    if (serviceData.imageUrl !== undefined) dbService.image_url = serviceData.imageUrl;
    if (serviceData.awsModelUrl !== undefined) dbService.aws_model_url = serviceData.awsModelUrl;
    
    const { data, error } = await supabase
      .from('services')
      .update(dbService)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error updating service:', error);
      return null;
    }
    
    return mapDbServiceToService(data);
  } catch (err) {
    console.error('Error in updateService:', err);
    return null;
  }
};

export const deleteService = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting service:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error in deleteService:', err);
    return false;
  }
};

// Subscription Functions
export const getUserSubscriptions = async (userId: string): Promise<Subscription[]> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        services:service_id (name)
      `)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user subscriptions:', error);
      return [];
    }
    
    return data.map((sub: any) => ({
      id: sub.id,
      userId: sub.user_id,
      serviceId: sub.service_id,
      status: sub.status as 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'CANCELLED',
      startDate: sub.start_date,
      endDate: sub.end_date || '',
      createdAt: sub.created_at,
      updatedAt: sub.updated_at,
      serviceName: sub.services?.name || ''
    }));
  } catch (err) {
    console.error('Error in getUserSubscriptions:', err);
    return [];
  }
};

export const getSubscriptionStatus = async (userId: string, serviceId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', userId)
      .eq('service_id', serviceId)
      .single();
    
    if (error) {
      console.error('Error fetching subscription status:', error);
      return null;
    }
    
    return data?.status || null;
  } catch (err) {
    console.error('Error in getSubscriptionStatus:', err);
    return null;
  }
};

export const createSubscription = async (userId: string, serviceId: string): Promise<Subscription | null> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([{
        user_id: userId,
        service_id: serviceId,
        status: 'PENDING',
        start_date: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error creating subscription:', error);
      return null;
    }
    
    const serviceName = await getServiceName(serviceId);
    return {
      id: data.id,
      userId: data.user_id,
      serviceId: data.service_id,
      status: data.status as 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'CANCELLED',
      startDate: data.start_date,
      endDate: data.end_date || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      serviceName
    };
  } catch (err) {
    console.error('Error in createSubscription:', err);
    return null;
  }
};

export const updateSubscriptionStatus = async (id: string, status: 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'CANCELLED'): Promise<Subscription | null> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error updating subscription status:', error);
      return null;
    }
    
    const serviceName = await getServiceName(data.service_id);
    return {
      id: data.id,
      userId: data.user_id,
      serviceId: data.service_id,
      status: data.status as 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'CANCELLED',
      startDate: data.start_date,
      endDate: data.end_date || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      serviceName
    };
  } catch (err) {
    console.error('Error in updateSubscriptionStatus:', err);
    return null;
  }
};

// Helper for getting service name
const getServiceName = async (serviceId: string): Promise<string> => {
  try {
    const { data } = await supabase
      .from('services')
      .select('name')
      .eq('id', serviceId)
      .single();
    
    return data?.name || '';
  } catch {
    return '';
  }
};

// Helper for getting user name
const getUserName = async (userId: string): Promise<string> => {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single();
    
    return data?.name || '';
  } catch {
    return '';
  }
};

// User Functions
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
    
    return data.map(mapDbProfileToUser);
  } catch (err) {
    console.error('Error in getAllUsers:', err);
    return [];
  }
};

// Get all subscriptions for admin
export const getAllSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        services:service_id (name),
        profiles:user_id (name)
      `);
    
    if (error) {
      console.error('Error fetching all subscriptions:', error);
      return [];
    }
    
    return data.map((sub: any) => ({
      id: sub.id,
      userId: sub.user_id,
      serviceId: sub.service_id,
      status: sub.status as 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'CANCELLED',
      startDate: sub.start_date,
      endDate: sub.end_date || '',
      createdAt: sub.created_at,
      updatedAt: sub.updated_at,
      serviceName: sub.services?.name || '',
      userName: sub.profiles?.name || ''
    }));
  } catch (err) {
    console.error('Error in getAllSubscriptions:', err);
    return [];
  }
};

// Feature request functions
export const submitFeatureRequest = async (title: string, description: string): Promise<FeatureRequest | null> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('feature_requests')
      .insert([{
        title,
        description,
        user_id: userId,
        status: 'NEW'
      }])
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error submitting feature request:', error);
      return null;
    }
    
    return mapDbFeatureRequestToFeatureRequest(data);
  } catch (err) {
    console.error('Error in submitFeatureRequest:', err);
    return null;
  }
};

export const getUserFeatureRequests = async (): Promise<FeatureRequest[]> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('feature_requests')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user feature requests:', error);
      return [];
    }
    
    return data.map(mapDbFeatureRequestToFeatureRequest);
  } catch (err) {
    console.error('Error in getUserFeatureRequests:', err);
    return [];
  }
};

export const getAllFeatureRequests = async (): Promise<FeatureRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('feature_requests')
      .select(`
        *,
        profiles:user_id (email)
      `);
    
    if (error) {
      console.error('Error fetching all feature requests:', error);
      return [];
    }
    
    return data.map((req: any) => ({
      id: req.id,
      title: req.title,
      description: req.description,
      status: req.status as 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED',
      userId: req.user_id,
      userEmail: req.profiles?.email || '',
      submittedAt: req.created_at
    }));
  } catch (err) {
    console.error('Error in getAllFeatureRequests:', err);
    return [];
  }
};

export const updateFeatureRequestStatus = async (id: string, status: string): Promise<FeatureRequest | null> => {
  try {
    const { data, error } = await supabase
      .from('feature_requests')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        profiles:user_id (email)
      `)
      .single();
    
    if (error || !data) {
      console.error('Error updating feature request status:', error);
      return null;
    }
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status as 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED',
      userId: data.user_id,
      userEmail: data.profiles?.email || '',
      submittedAt: data.created_at
    };
  } catch (err) {
    console.error('Error in updateFeatureRequestStatus:', err);
    return null;
  }
};

// Usage Functions
export const recordUsage = async (serviceId: string, amount: number = 1): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return false;
    }
    
    const { error } = await supabase
      .from('usage')
      .insert([{
        user_id: userId,
        service_id: serviceId,
        amount
      }]);
    
    if (error) {
      console.error('Error recording usage:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error in recordUsage:', err);
    return false;
  }
};
