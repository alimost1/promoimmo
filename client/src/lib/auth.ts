import { apiRequest } from "./queryClient";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export class AuthService {
  private static instance: AuthService;
  private currentUser: AuthUser | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(username: string, password: string): Promise<AuthUser> {
    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        username,
        password,
      });
      const user = await response.json();
      this.currentUser = user;
      return user;
    } catch (error) {
      throw new Error("Invalid credentials");
    }
  }

  async logout(): Promise<void> {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      this.currentUser = null;
    } catch (error) {
      // Handle logout error
      this.currentUser = null;
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const response = await apiRequest("GET", "/api/auth/me", {});
      const user = await response.json();
      this.currentUser = user;
      return user;
    } catch (error) {
      this.currentUser = null;
      return null;
    }
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }): Promise<AuthUser> {
    try {
      const response = await apiRequest("POST", "/api/users", userData);
      const user = await response.json();
      return user;
    } catch (error: any) {
      throw new Error(error.message || "Registration failed");
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole("admin");
  }

  isOwner(): boolean {
    return this.hasRole("owner");
  }

  isStaff(): boolean {
    return this.hasRole("staff");
  }
}

export const authService = AuthService.getInstance();
