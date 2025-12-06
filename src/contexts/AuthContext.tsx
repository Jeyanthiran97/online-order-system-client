"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import apiClient from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import { User, UserRole } from "@/types/user";

export type { UserRole };

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    const token = Cookies.get("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get("/auth/me");
      const userDataFromApi = response.data.data.user;
      const profileData = response.data.data.profile; // Profile is a separate object

      // Merge user and profile data
      const fullUserData = {
        ...userDataFromApi,
        _id: userDataFromApi.id || userDataFromApi._id,
        profile: profileData, // Add profile to user object
      };

      setUser(fullUserData);
      Cookies.set("user", JSON.stringify(fullUserData), { expires: 7 });
    } catch (error) {
      console.error("Failed to fetch user", error);
      Cookies.remove("token");
      Cookies.remove("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for existing session
    const token = Cookies.get("token");
    const storedUser = Cookies.get("user");

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Refresh user data to get latest approval status
        refreshUser();
      } catch (e) {
        console.error("Failed to parse user cookie", e);
        Cookies.remove("user");
        Cookies.remove("token");
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (token: string, userData: User) => {
    Cookies.set("token", token, { expires: 7 }); // 7 days
    Cookies.set("user", JSON.stringify(userData), { expires: 7 });

    // Fetch full user profile to check approval status
    try {
      const response = await apiClient.get("/auth/me");
      const userDataFromApi = response.data.data.user;
      const profileData = response.data.data.profile; // Profile is a separate object, not nested in user

      // Merge user and profile data
      const fullUserData = {
        ...userDataFromApi,
        _id: userDataFromApi.id || userDataFromApi._id,
        profile: profileData, // Add profile to user object for consistency
      };

      setUser(fullUserData);
      Cookies.set("user", JSON.stringify(fullUserData), { expires: 7 });
      setLoading(false); // Ensure loading is set to false after login

      // Check approval status for sellers and deliverers
      if (fullUserData.role === "seller" || fullUserData.role === "deliverer") {
        // Profile status is at profile.status (not user.profile.status in API response)
        const status = profileData?.status;
        if (status !== "approved") {
          // Block login if not approved
          Cookies.remove("token");
          Cookies.remove("user");
          setUser(null);
          setLoading(false);
          throw new Error(
            status === "pending"
              ? "Your account is pending approval. Please wait for admin approval."
              : status === "rejected"
              ? `Your account has been rejected. ${profileData?.reason || ""}`
              : "Your account is not approved yet."
          );
        }
      }

      // Redirect based on role
      switch (fullUserData.role) {
        case "admin":
          router.push("/admin");
          break;
        case "seller":
          router.push("/seller");
          break;
        case "deliverer":
          router.push("/deliverer");
          break;
        case "customer":
          router.push("/customer");
          break;
        default:
          router.push("/");
      }
    } catch (error: any) {
      // Ensure loading is false even on error
      setLoading(false);
      // Re-throw the error so the login page can handle it
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
