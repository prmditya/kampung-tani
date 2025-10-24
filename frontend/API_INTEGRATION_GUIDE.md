# API Integration Guide

Panduan lengkap untuk mengintegrasikan frontend dengan backend API yang sudah tersedia.

## 📋 Table of Contents

1. [Setup & Prerequisites](#setup--prerequisites)
2. [API Types](#api-types)
3. [API Hooks Structure](#api-hooks-structure)
4. [Integration Steps](#integration-steps)
5. [Available Endpoints](#available-endpoints)
6. [Usage Examples](#usage-examples)

---

## 🚀 Setup & Prerequisites

### Files Already Created:

✅ **TypeScript Types**: `/src/types/api.ts`

- Semua interface API sudah didefinisikan
- Type-safe dengan backend Pydantic schemas

✅ **API Client**: `/src/lib/api-client.ts`

- Axios instance dengan interceptor
- Base URL: `http://localhost:5000/api/v1`
- Auto-attach Bearer token

✅ **Auth Hooks**: `/src/hooks/use-auth.ts`

- `useLogin()` - ✅ Sudah terintegrasi
- `useLogout()` - ✅ Sudah terintegrasi

✅ **Entity Hooks**: (Siap untuk integrasi)

- `/src/hooks/use-gateways.ts`
- `/src/hooks/use-sensors.ts`
- `/src/hooks/use-farmers.ts`
- `/src/hooks/use-farms.ts`

---

## 📦 API Types

Semua types sudah tersedia di `/src/types/api.ts`:

### Entities:

- **User**: `UserResponse`, `UserCreate`, `UserUpdate`
- **Gateway**: `GatewayResponse`, `GatewayCreate`, `GatewayUpdate`
- **Sensor**: `SensorResponse`, `SensorCreate`, `SensorUpdate`
- **Farmer**: `FarmerResponse`, `FarmerCreate`, `FarmerUpdate`
- **Farm**: `FarmResponse`, `FarmCreate`, `FarmUpdate`
- **Gateway Assignment**: `GatewayAssignmentResponse`, `GatewayAssignmentCreate`
- **Gateway Status History**: `GatewayStatusHistoryResponse`

### Enums:

```typescript
enum UserRole {
  USER,
  ADMIN,
}
enum GatewayStatus {
  ONLINE,
  OFFLINE,
  MAINTENANCE,
}
enum SensorStatus {
  ACTIVE,
  INACTIVE,
  ERROR,
}
```

---

## 🎣 API Hooks Structure

Setiap entity memiliki hooks standar:

### Pattern:

```typescript
// Query Hooks (GET)
useEntities(); // Get all
useEntity(id); // Get by ID

// Mutation Hooks (POST/PUT/DELETE)
useCreateEntity(); // Create new
useUpdateEntity(); // Update existing
useDeleteEntity(); // Delete
```

### Query Keys:

Setiap hook menggunakan query keys untuk cache management:

```typescript
export const entityKeys = {
  all: ["entities"],
  lists: () => [...entityKeys.all, "list"],
  list: (filters) => [...entityKeys.lists(), filters],
  details: () => [...entityKeys.all, "detail"],
  detail: (id) => [...entityKeys.details(), id],
};
```

---

## 🔧 Integration Steps

### Step 1: Enable Hook

Di setiap hook file, ubah `enabled: false` menjadi `enabled: true`:

**Before:**

```typescript
export function useGateways() {
  return useQuery({
    queryKey: gatewayKeys.list(),
    queryFn: async () => { ... },
    enabled: false,  // ❌ Disabled
  });
}
```

**After:**

```typescript
export function useGateways() {
  return useQuery({
    queryKey: gatewayKeys.list(),
    queryFn: async () => { ... },
    enabled: true,   // ✅ Enabled
  });
}
```

### Step 2: Use in Component

**Example: Farmers Page**

```typescript
"use client";

import { useFarmers, useCreateFarmer, useDeleteFarmer } from "@/hooks/use-farmers";
import type { FarmerCreate } from "@/types/api";

export default function FarmersPage() {
  // Fetch data
  const { data: farmers, isLoading, error } = useFarmers();

  // Mutations
  const createMutation = useCreateFarmer();
  const deleteMutation = useDeleteFarmer();

  const handleCreate = (data: FarmerCreate) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        // Show success message
        console.log("Farmer created!");
      },
      onError: (error) => {
        // Show error message
        console.error("Failed:", error);
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {farmers?.map(farmer => (
        <div key={farmer.id}>
          <h3>{farmer.name}</h3>
          <p>{farmer.contact}</p>
          <button onClick={() => handleDelete(farmer.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Step 3: Update Form Types

Sesuaikan form types dengan API schema:

**Old (Dummy):**

```typescript
type Farmer = {
  id: string;
  name: string;
  farmName: string; // ❌ Not in API
  email: string; // ❌ Not in API
  // ...
};
```

**New (API):**

```typescript
import type { FarmerResponse, FarmerCreate } from "@/types/api";

// Use API types directly
const farmer: FarmerResponse = {
  id: 1,
  name: "John Doe",
  contact: "+62 812-3456-7890",
  address: "Bandung, West Java",
  created_at: "2024-01-01T00:00:00Z",
};
```

---

## 📍 Available Endpoints

### Authentication

```typescript
POST / auth / login; // ✅ Terintegrasi
POST / auth / register;
POST / auth / logout; // ✅ Terintegrasi
GET / auth / me;
```

### Gateways

```typescript
GET / gateways; // Get all gateways
GET / gateways / { id }; // Get gateway by ID
POST / gateways; // Create new gateway
PUT / gateways / { id }; // Update gateway
DELETE / gateways / { id }; // Delete gateway
```

### Sensors

```typescript
GET / sensors; // Get all sensors
GET / sensors / { id }; // Get sensor by ID
GET / sensors / gateway / { id }; // Get sensors by gateway
POST / sensors; // Create new sensor
PUT / sensors / { id }; // Update sensor
DELETE / sensors / { id }; // Delete sensor
```

### Farmers

```typescript
GET / farmers; // Get all farmers
GET / farmers / { id }; // Get farmer by ID
POST / farmers; // Create new farmer
PUT / farmers / { id }; // Update farmer
DELETE / farmers / { id }; // Delete farmer
```

### Farms

```typescript
GET / farms; // Get all farms
GET / farms / { id }; // Get farm by ID
GET / farms / farmer / { id }; // Get farms by farmer
POST / farms; // Create new farm
PUT / farms / { id }; // Update farm
DELETE / farms / { id }; // Delete farm
```

### Gateway Assignments

```typescript
GET / gateway - assignments; // Get all assignments
GET / gateway - assignments / { id }; // Get assignment by ID
POST / gateway - assignments; // Create assignment
PUT / gateway - assignments / { id }; // Update assignment
DELETE / gateway - assignments / { id }; // Delete assignment
```

---

## 💡 Usage Examples

### Example 1: Fetch Gateways with Pagination

```typescript
import { useGateways } from "@/hooks/use-gateways";

function GatewaysPage() {
  const { data: gateways } = useGateways({
    skip: 0,
    limit: 10
  });

  return (
    <div>
      {gateways?.map(gateway => (
        <div key={gateway.id}>
          <h3>{gateway.name || gateway.gateway_uid}</h3>
          <Badge variant={gateway.status}>
            {gateway.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Create Gateway

```typescript
import { useCreateGateway } from "@/hooks/use-gateways";
import { GatewayCreate, GatewayStatus } from "@/types/api";

function AddGatewayDialog() {
  const createMutation = useCreateGateway();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: GatewayCreate = {
      gateway_uid: formData.get("gateway_uid") as string,
      name: formData.get("name") as string,
      mac_address: formData.get("mac_address") as string,
      description: formData.get("description") as string,
      status: GatewayStatus.OFFLINE,
    };

    createMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="gateway_uid" placeholder="Gateway UID" required />
      <input name="name" placeholder="Name" />
      <input name="mac_address" placeholder="MAC Address" />
      <textarea name="description" placeholder="Description" />
      <button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? "Creating..." : "Create Gateway"}
      </button>
    </form>
  );
}
```

### Example 3: Update Gateway Status

```typescript
import { useUpdateGateway } from "@/hooks/use-gateways";
import { GatewayStatus } from "@/types/api";

function GatewayStatusToggle({ gateway }: { gateway: GatewayResponse }) {
  const updateMutation = useUpdateGateway();

  const handleStatusChange = (newStatus: GatewayStatus) => {
    updateMutation.mutate({
      id: gateway.id,
      data: { status: newStatus }
    });
  };

  return (
    <Select
      value={gateway.status}
      onValueChange={handleStatusChange}
      disabled={updateMutation.isPending}
    >
      <SelectItem value="online">Online</SelectItem>
      <SelectItem value="offline">Offline</SelectItem>
      <SelectItem value="maintenance">Maintenance</SelectItem>
    </Select>
  );
}
```

### Example 4: Delete with Confirmation

```typescript
import { useDeleteGateway } from "@/hooks/use-gateways";

function DeleteGatewayButton({ gatewayId }: { gatewayId: number }) {
  const deleteMutation = useDeleteGateway();

  const handleDelete = () => {
    if (confirm("Are you sure?")) {
      deleteMutation.mutate(gatewayId, {
        onSuccess: () => {
          alert("Gateway deleted successfully!");
        },
        onError: (error) => {
          alert(`Error: ${error.message}`);
        }
      });
    }
  };

  return (
    <Button
      onClick={handleDelete}
      disabled={deleteMutation.isPending}
      variant="destructive"
    >
      {deleteMutation.isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}
```

### Example 5: Loading & Error States

```typescript
function FarmersPage() {
  const { data, isLoading, isError, error } = useFarmers();

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      {data?.map(farmer => (
        <FarmerCard key={farmer.id} farmer={farmer} />
      ))}
    </div>
  );
}
```

---

## 🔐 Authentication

Token sudah otomatis di-attach ke setiap request melalui axios interceptor:

```typescript
// Di api-client.ts (sudah ada)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## ✅ Checklist Integrasi

### Farmers Page

- [ ] Enable `useFarmers()` hook
- [ ] Update form fields sesuai `FarmerCreate` type
- [ ] Hapus dummy data import
- [ ] Integrate create farmer dialog
- [ ] Integrate edit farmer
- [ ] Integrate delete farmer
- [ ] Update table columns sesuai `FarmerResponse`

### Devices Page (Gateways & Sensors)

- [ ] Enable `useGateways()` hook
- [ ] Enable `useSensors()` hook
- [ ] Update status enum dari `active/inactive/maintenance` ke `GatewayStatus`
- [ ] Hapus dummy data import
- [ ] Integrate create gateway dialog
- [ ] Integrate edit gateway
- [ ] Integrate delete gateway

### Farms Page (Belum ada)

- [ ] Create farms page
- [ ] Use `useFarms()` hook
- [ ] Link dengan farmers via `farmer_id`

### Assignments Page

- [ ] Enable `useGatewayAssignments()` hook (need to create)
- [ ] Show gateway-farm relationships

---

## 🐛 Troubleshooting

### 1. CORS Error

**Problem**: `Access-Control-Allow-Origin` error

**Solution**: Backend sudah di-fix di `.env.local`:

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002,http://127.0.0.1:3000,http://127.0.0.1:3002
```

Restart backend server!

### 2. 401 Unauthorized

**Problem**: API returns 401

**Solution**:

- Check if token exists: `localStorage.getItem("token")`
- Login lagi jika token expired
- Verify token format di Network tab

### 3. Type Errors

**Problem**: TypeScript errors dengan API types

**Solution**:

- Import types dari `/src/types/api.ts`
- Gunakan types yang sudah didefinisikan, jangan buat sendiri
- Check field names match dengan API (e.g., `gateway_uid` bukan `gatewayUid`)

---

## 📚 Additional Resources

- **Backend API Docs**: http://localhost:5000/api/v1/docs
- **TanStack Query Docs**: https://tanstack.com/query/latest/docs/react/overview
- **Axios Docs**: https://axios-http.com/docs/intro

---

## 🎯 Next Steps

1. **Test Login**: Pastikan login berfungsi dengan backend
2. **Enable One Hook**: Mulai dengan `useFarmers()` atau `useGateways()`
3. **Update One Page**: Integrate satu page dulu (misal Farmers)
4. **Test CRUD**: Test Create, Read, Update, Delete
5. **Repeat**: Ulangi untuk entity lainnya

Good luck dengan integrasi! 🚀
