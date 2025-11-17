import { http, HttpResponse } from "msw";
import { faker } from "@faker-js/faker";
import type { User } from "../types/auth";

// Define interfaces for Role and Permission
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  key: string;
  label: string;
  children?: Permission[];
}

// Mock users data
const mockUsers = Array.from({ length: 10 }, (_, index) => {
  const role = index === 0 ? "admin" : "user";
  // Assign permissions based on role
  let permissions: string[] = [];
  
  if (role === "admin") {
    permissions = ["users:read", "users:write", "users:delete", "roles:read", "roles:write", "roles:delete", "dashboard:read", "settings:read", "settings:write"];
  } else if (role === "user") {
    permissions = ["dashboard:read", "settings:read"];
  }
  
  return {
    id: index + 1,
    name: faker.internet.username(),
    email: faker.internet.email(),
    phone: "13521984122",
    password: "123456", // Add password field
    role,
    permissions,
    status: "active",
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  };
});

// Mock roles data
const mockRoles: Role[] = Array.from({ length: 5 }, (_, index) => ({
  id: faker.string.uuid(),
  name: index === 0 ? "admin" : faker.company.buzzNoun().toLowerCase(),
  description: faker.lorem.sentence(),
  permissions:
    index === 0
      ? [
          "users:read",
          "users:write",
          "users:delete",
          "roles:read",
          "roles:write",
          "roles:delete",
          "dashboard:read",
          "settings:read",
          "settings:write",
        ]
      : [
          faker.lorem.word().toLowerCase() +
            ":" +
            faker.lorem.word().toLowerCase(),
        ],
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
}));

// Mock permissions data
const mockPermissions: Permission[] = [
  {
    key: "users",
    label: "User Management",
    children: [
      { key: "users:read", label: "View Users" },
      { key: "users:write", label: "Create/Edit Users" },
      { key: "users:delete", label: "Delete Users" },
    ],
  },
  {
    key: "roles",
    label: "Role Management",
    children: [
      { key: "roles:read", label: "View Roles" },
      { key: "roles:write", label: "Create/Edit Roles" },
      { key: "roles:delete", label: "Delete Roles" },
    ],
  },
  {
    key: "dashboard",
    label: "Dashboard",
    children: [{ key: "dashboard:read", label: "View Dashboard" }],
  },
  {
    key: "settings",
    label: "Settings",
    children: [
      { key: "settings:read", label: "View Settings" },
      { key: "settings:write", label: "Edit Settings" },
    ],
  },
];



// Define mock handlers
export const handlers = [
  // Login endpoint
  http.post<never, { identifier: string | number; password: string }>(
    "/api/auth/login",
    async (req) => {
      const { identifier, password } = await req.request.json() as { identifier: string | number; password: string };

      // Find user by email or phone (convert phone to string for comparison)
      const user = mockUsers.find(
        (u) => u.email === identifier || u.phone === String(identifier)
      );

      if (!user) {
        return HttpResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      if (user.password !== password) {
        return HttpResponse.json(
          { success: false, message: "Invalid password" },
          { status: 401 }
        );
      }

      // Generate mock tokens
      const token = faker.string.alphanumeric(128);
      const refreshToken = faker.string.alphanumeric(128);

      return HttpResponse.json(
        { success: true, data: { token, refreshToken, user } },
        { status: 200 }
      );
    }
  ),

  // Register endpoint
  http.post<never, { email: string; phone: string }>(
    "/api/auth/register",
    async (req) => {
      const res = await req.request.json();
      const { email, phone } = res;

      // Check if user already exists
      const existingUser = mockUsers.find(
        (u) => u.email === email || u.phone === phone
      );

      if (existingUser) {
        return HttpResponse.json(
          {
            success: false,
            message: "User already exists",
          },
          { status: 400 }
        );
      }

      // Create new user
      const newUser = {
        id: mockUsers.length + 1,
        name: faker.internet.username(),
        email,
        phone,
        password: faker.internet.password(), // Generate random password
        role: "user",
        permissions: ["dashboard:read", "settings:read"],
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUsers.push(newUser);

      // Generate mock tokens for consistency with login
      const token = faker.string.alphanumeric(128);
      const refreshToken = faker.string.alphanumeric(128);

      return HttpResponse.json(
        {
          success: true,
          data: {
            token,
            refreshToken,
            user: newUser,
          },
        },
        { status: 201 }
      );
    }
  ),

  // Get current user endpoint
  http.get("/api/auth/me", () => {
    // Return the first user as current user
    return HttpResponse.json(
      {
        success: true,
        data: mockUsers[0],
      },
      { status: 200 }
    );
  }),

  // Get users list endpoint
  http.get("/api/users", (req) => {
    // Simulate pagination
    const url = new URL(req.request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const total = mockUsers.length;

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const users = mockUsers.slice(startIndex, endIndex);

    return HttpResponse.json(
      {
        success: true,
        data: {
          items: users,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      },
      { status: 200 }
    );
  }),

  // Get user by ID endpoint
  http.get<{ id: string }, User>("/api/users/:id", (req) => {
    const id = parseInt(req.params.id as string);
    const user = mockUsers.find((u) => u.id === id);

    if (user) {
      return HttpResponse.json(
        {
          success: true,
          data: user,
        },
        { status: 200 }
      );
    }

    return HttpResponse.json(
      {
        success: false,
        message: "User not found",
      },
      { status: 404 }
    );
  }),

  // Update user endpoint
  http.put<{ id: string }, User>("/api/users/:id", async (req) => {
    const id = parseInt(req.params.id as string);
    const updateData = await req.request.json();

    const userIndex = mockUsers.findIndex((u) => u.id === id);

    if (userIndex !== -1) {
      const user = mockUsers[userIndex];
      const updatedUser = {
        ...user,
        ...updateData,
        permissions: updateData.permissions || user?.permissions || [],
        updatedAt: new Date().toISOString(),
      };
      mockUsers[userIndex] = {
        ...updatedUser,
        id: Number(updatedUser.id),
        password: updatedUser.password ?? user?.password,
      };

      return HttpResponse.json(
        {
          success: true,
          data: updatedUser,
        },
        { status: 200 }
      );
    }

    return HttpResponse.json(
      {
        success: false,
        message: "User not found",
      },
      { status: 404 }
    );
  }),

  // Delete user endpoint
  http.delete("/api/users/:id", (req) => {
    const id = parseInt(req.params.id as string);
    const userIndex = mockUsers.findIndex((u) => u.id === id);

    if (userIndex !== -1) {
      const deletedUser = mockUsers.splice(userIndex, 1)[0];

      return HttpResponse.json(
        { success: true, data: deletedUser },
        { status: 200 }
      );
    }

    return HttpResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }),

  // Create user endpoint
  http.post<never, User>("/api/users", async (req) => {
    const userData = await req.request.json();

    // Check if user already exists (by email or phone)
    const existingUser = mockUsers.find(
      (u) => u.email === userData.email || u.phone === userData.phone
    );

    if (existingUser) {
      return HttpResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    // Create new user
      const role = userData.role || "user";
      let permissions: string[] = [];

      if (role === "admin") {
        permissions = ["users:read", "users:write", "users:delete", "roles:read", "roles:write", "roles:delete", "dashboard:read", "settings:read", "settings:write"];
      } else if (role === "user") {
        permissions = ["dashboard:read", "settings:read"];
      }

      const newUser = {
        ...userData,
        permissions: userData.permissions || permissions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

    mockUsers.push({ ...newUser, id: Number(newUser.id) });

    return HttpResponse.json({ success: true, data: newUser }, { status: 201 });
  }),

  // Get roles list endpoint
  http.get("/api/roles", (req) => {
    // Simulate pagination
    const url = new URL(req.request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    const name = url.searchParams.get("name");
    const total = mockRoles.length;

    let filteredRoles = [...mockRoles];

    // Filter by name
    if (name) {
      filteredRoles = filteredRoles.filter((role) => role.name.includes(name));
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const roles = filteredRoles.slice(startIndex, endIndex);

    return HttpResponse.json(
      { success: true, data: { list: roles, total } },
      { status: 200 }
    );
  }),

  // Get role by ID endpoint
  http.get("/api/roles/:id", (req) => {
    const id = req.params.id as string;
    const role = mockRoles.find((r) => r.id === id);

    if (role) {
      return HttpResponse.json({ success: true, data: role }, { status: 200 });
    }

    return HttpResponse.json(
      { success: false, message: "Role not found" },
      { status: 404 }
    );
  }),

  // Create role endpoint
  http.post<never, Omit<Role, "id" | "createdAt" | "updatedAt">>("/api/roles", async (req) => {
    const roleData = await req.request.json();

    // Check if role already exists
    const existingRole = mockRoles.find((r) => r.name === roleData.name);

    if (existingRole) {
      return HttpResponse.json(
        { success: false, message: "Role already exists" },
        { status: 400 }
      );
    }

    // Create new role
    const newRole: Role = {
      id: faker.string.uuid(),
      ...roleData,
      permissions: Array.isArray(roleData.permissions)
        ? roleData.permissions
        : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockRoles.push(newRole);

    return HttpResponse.json({ success: true, data: newRole }, { status: 201 });
  }),

  // Update role endpoint
  http.put("/api/roles/:id", async (req) => {
    const id = req.params.id as string;
    const updateData = await req.request.json() as Partial<Role>;

    const roleIndex = mockRoles.findIndex((r) => r.id === id);

    if (roleIndex !== -1) {
      const role = mockRoles[roleIndex];
      const updatedRole = {
        ...role,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      mockRoles[roleIndex] = updatedRole as Role;

      return HttpResponse.json(
        { success: true, data: updatedRole },
        { status: 200 }
      );
    }

    return HttpResponse.json(
      { success: false, message: "Role not found" },
      { status: 404 }
    );
  }),

  // Delete role endpoint
  http.delete("/api/roles/:id", (req) => {
    const id = req.params.id as string;
    const roleIndex = mockRoles.findIndex((r) => r.id === id);

    if (roleIndex !== -1) {
      const deletedRole = mockRoles.splice(roleIndex, 1)[0];

      return HttpResponse.json(
        { success: true, data: deletedRole },
        { status: 200 }
      );
    }

    return HttpResponse.json(
      { success: false, message: "Role not found" },
      { status: 404 }
    );
  }),

  // Batch delete roles endpoint
  http.delete("/api/roles/batch", async (req) => {
    const { ids } = await req.request.json() as { ids: string[] };

    if (!Array.isArray(ids)) {
      return HttpResponse.json(
        { success: false, message: "Invalid request" },
        { status: 400 }
      );
    }

    const deletedRoles = [];

    for (const id of ids) {
      const roleIndex = mockRoles.findIndex((r) => r.id === id);
      if (roleIndex !== -1) {
        deletedRoles.push(mockRoles.splice(roleIndex, 1)[0]);
      }
    }

    return HttpResponse.json(
      { success: true, data: deletedRoles },
      { status: 200 }
    );
  }),

  // Get all permissions endpoint
  http.get("/api/permissions", () => {
    return HttpResponse.json(
      { success: true, data: mockPermissions },
      { status: 200 }
    );
  }),

  // Get permissions by role endpoint
  http.get("/api/roles/:id/permissions", (req) => {
    const id = req.params.id as string;
    const role = mockRoles.find((r) => r.id === id);

    if (role) {
      // Return permissions with structure matching mockPermissions
      const getPermissionsByKeys = (keys: string[]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: any[] = [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const findPermission = (permission: any) => {
          if (keys.includes(permission.key)) {
            const children = permission.children
              ? getPermissionsByKeys(keys).filter((p) =>
                  p.key.startsWith(permission.key + ":")
                )
              : [];
            return {
              ...permission,
              children: children.length > 0 ? children : undefined,
            };
          }
          return null;
        };

        for (const perm of mockPermissions) {
          const found = findPermission(perm);
          if (found) result.push(found);
        }

        return result;
      };

      return HttpResponse.json(
        { success: true, data: getPermissionsByKeys(role.permissions) },
        { status: 200 }
      );
    }

    return HttpResponse.json(
      { success: false, message: "Role not found" },
      { status: 404 }
    );
  }),

  // Update role permissions endpoint
  http.put("/api/roles/:id/permissions", async (req) => {
    const id = req.params.id as string;
    const { permissions } = await req.request.json() as { permissions: string[] };

    const roleIndex = mockRoles.findIndex((r) => r.id === id);

    if (roleIndex !== -1) {
      const role = mockRoles[roleIndex];
      const updatedRole = {
        ...role,
        permissions: Array.isArray(permissions) ? permissions : [],
        updatedAt: new Date().toISOString(),
      } as Role;
      mockRoles[roleIndex] = updatedRole;

      return HttpResponse.json(
        { success: true, data: updatedRole },
        { status: 200 }
      );
    }

    return HttpResponse.json(
      { success: false, message: "Role not found" },
      { status: 404 }
    );
  }),
];
