import { serverUrl } from "../environment";

export interface DashboardStats {
  memoryScore: number;
  focusLevel: number;
  streak: number;
  avgSessionDuration: number;
  recentSessions: {
    id: string;
    title: string;
    duration: number;
    accuracy: number;
  }[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch(`${serverUrl}/dashboard/stats`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    if (response.status === 404) {
      throw new Error("Dashboard data not found");
    }
    throw new Error("Failed to fetch dashboard data");
  }

  return response.json();
};
