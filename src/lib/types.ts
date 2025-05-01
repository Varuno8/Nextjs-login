
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: string;
  imageUrl?: string;
  awsModelUrl?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  phoneNumber?: string;
  role: 'USER' | 'ADMIN';
  subscriptions?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  serviceId: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'CANCELLED';
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  serviceName?: string;
  userName?: string;
  serviceDescription?: string;
  servicePrice?: number;
  serviceImageUrl?: string;
}

export interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  status: 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  userId: string;
  userEmail?: string;
  submittedAt: string;
}
