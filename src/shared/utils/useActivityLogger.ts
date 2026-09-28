import skyshareApi from "@shared/api/skyshareApi";

export interface ActivityLogEntry {
  id: number;
  admin_id: number | null;
  admin_name: string;
  action: string;
  ip_address: string | null;
  createdAt: string;
}

const MAX_ACTION_LENGTH = 120;

/**
 * Directly records an admin action activity log to the server.
 * Fails gracefully without breaking calling workflows.
 */
export async function logActivity(
  action: string,
  adminName?: string
): Promise<boolean> {
  try {
    const trimmedAction = action ? action.trim().slice(0, MAX_ACTION_LENGTH) : "";
    await skyshareApi.post("/analytics/log", {
      action: trimmedAction,
      admin_name: adminName,
    });
    return true;
  } catch (error) {
    console.warn("[ActivityLogger] Failed to log activity:", error);
    return false;
  }
}

/**
 * Hook for recording activity logs from React components.
 */
export function useActivityLogger() {
  const recordLog = async (action: string, adminName?: string) => {
    return await logActivity(action, adminName);
  };

  return { recordLog };
}

export default useActivityLogger;
