import type { User } from "@supabase/supabase-js";

const managerRoles = new Set(["agent", "landlord", "owner"]);

export const isAdminUser = (user?: User | null) =>
  user?.user_metadata?.user_type === "admin" ||
  user?.app_metadata?.role === "admin" ||
  user?.app_metadata?.user_type === "admin";

export const getDashboardPathForUser = (user?: User | null) => {
  if (isAdminUser(user)) return "/admin";

  const userType = user?.user_metadata?.user_type;
  return managerRoles.has(userType) ? "/dashboard/manager" : "/dashboard/user";
};
