/**
 * API TypeScript Types
 * Auto-generated from backend Pydantic schemas
 * DO NOT MODIFY - Update backend schemas instead
 */

// ==================== BASE TYPES ====================

export interface BaseSchema {
  // Base schema for all models
}

export interface MessageResponse {
  message: string;
}

export interface ErrorResponse {
  detail: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// ==================== USER TYPES ====================

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

export interface UserBase {
  username: string;
  email: string;
  role: UserRole;
}

export interface UserCreate extends UserBase {
  password: string;
}

export interface UserUpdate {
  email?: string;
  role?: UserRole;
}

export interface UserResponse extends UserBase {
  id: number;
  created_at: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: UserResponse;
}

// ==================== GATEWAY TYPES ====================

export enum GatewayStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  MAINTENANCE = "maintenance",
}

export interface GatewayBase {
  gateway_uid: string;
  name?: string | null;
  mac_address?: string | null;
  description?: string | null;
  status: GatewayStatus;
}

export interface GatewayCreate extends GatewayBase {}

export interface GatewayUpdate {
  name?: string | null;
  mac_address?: string | null;
  description?: string | null;
  status?: GatewayStatus;
}

export interface GatewayResponse extends GatewayBase {
  id: number;
  user_id: number;
  last_seen?: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== SENSOR TYPES ====================

export enum SensorStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ERROR = "error",
}

export interface SensorBase {
  sensor_uid: string;
  name?: string | null;
  type: string;
  status: SensorStatus;
}

export interface SensorCreate extends SensorBase {
  gateway_id: number;
}

export interface SensorUpdate {
  name?: string | null;
  type?: string;
  status?: SensorStatus;
}

export interface SensorResponse extends SensorBase {
  id: number;
  gateway_id: number;
  created_at: string;
  updated_at: string;
}

// ==================== SENSOR DATA TYPES ====================

export interface SensorDataCreate {
  sensor_id: number;
  temperature?: number | null;
  humidity?: number | null;
  soil_moisture?: number | null;
  ph_level?: number | null;
  light_intensity?: number | null;
  timestamp?: string;
}

export interface SensorDataResponse extends SensorDataCreate {
  id: number;
  created_at: string;
}

export interface SensorDataBulkCreate {
  data: SensorDataCreate[];
}

// ==================== FARMER TYPES ====================

export interface FarmerBase {
  name: string;
  contact?: string | null;
  address?: string | null;
}

export interface FarmerCreate extends FarmerBase {}

export interface FarmerUpdate {
  name?: string;
  contact?: string | null;
  address?: string | null;
}

export interface FarmerResponse extends FarmerBase {
  id: number;
  created_at: string;
}

// ==================== FARM TYPES ====================

export interface FarmBase {
  farmer_id: number;
  name: string;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  area_size?: number | null;
  soil_type?: string | null;
}

export interface FarmCreate extends FarmBase {}

export interface FarmUpdate {
  farmer_id?: number;
  name?: string;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  area_size?: number | null;
  soil_type?: string | null;
}

export interface FarmResponse extends FarmBase {
  id: number;
  created_at: string;
  updated_at: string;
}

// ==================== GATEWAY ASSIGNMENT TYPES ====================

export interface GatewayAssignmentBase {
  gateway_id: number;
  farm_id: number;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
}

export interface GatewayAssignmentCreate {
  gateway_id: number;
  farm_id: number;
  start_date?: string | null;
  end_date?: string | null;
}

export interface GatewayAssignmentUpdate {
  farm_id?: number;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
}

export interface GatewayAssignmentResponse extends GatewayAssignmentBase {
  id: number;
  assigned_by?: number | null;
}

// ==================== GATEWAY STATUS HISTORY TYPES ====================

export interface GatewayStatusHistoryCreate {
  gateway_id: number;
  status: GatewayStatus;
  timestamp?: string;
}

export interface GatewayStatusHistoryResponse extends GatewayStatusHistoryCreate {
  id: number;
  created_at: string;
}

// ==================== HEALTH TYPES ====================

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
  database: {
    connected: boolean;
    database_name?: string;
  };
}
