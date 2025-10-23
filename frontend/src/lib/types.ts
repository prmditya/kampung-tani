export interface Device {
  id: string;
  name: string;
  status: "online" | "offline" | "active" | "inactive" | "maintenance";
  farmId?: string;
  farmName?: string;
  lastActive?: Date;
  lastSeen?: Date;
  batteryLevel?: number;
}

export interface Farmer {
  id: string;
  name: string;
  email: string;
  phone: string;
  farmId: string;
  farmName: string;
  location: string;
  devicesActive: number;
  createdAt: Date;
}

export interface Farm {
  id: string;
  name: string;
  location: string;
  farmerId: string;
  farmerName: string;
  area: number;
  devices: number;
}

export interface Assignment {
  id: string;
  deviceId: string;
  deviceName: string;
  farmerId: string;
  farmerName: string;
  farmId: string;
  farmName: string;
  assignedAt: Date;
  status: "active" | "inactive";
}

export interface SensorReading {
  id: string;
  deviceId: string;
  timestamp: Date;
  ph: number;
  temperature: number;
  turbidity: number;
  waterLevel: number;
}

export interface Admin {
  id: string;
  username: string;
  email: string;
  role: "super admin" | "admin";
  createdAt: Date;
  lastLogin?: Date;
}

export interface DashboardStats {
  totalDevices: number;
  activeDevices: number;
  assignedDevices: number;
  totalFarmers: number;
  totalFarms: number;
  todayReadings: number;
}
