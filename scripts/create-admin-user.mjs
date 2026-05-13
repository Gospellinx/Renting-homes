import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

const loadDotenv = () => {
  if (!existsSync(".env")) return;

  const lines = readFileSync(".env", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    const rawValue = trimmed.slice(equalsIndex + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
};

loadDotenv();

const required = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}.`);
  }
  return value;
};

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL || "admin@homesnigeria.local";
const adminPassword = process.env.ADMIN_PASSWORD;
const adminName = process.env.ADMIN_NAME || "Homes Nigeria Admin";

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL or VITE_SUPABASE_URL.");
}

required("SUPABASE_SERVICE_ROLE_KEY");
required("ADMIN_PASSWORD");

if (adminPassword.length < 12) {
  throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const findUserByEmail = async (email) => {
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;

    const foundUser = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (foundUser) return foundUser;
    if (data.users.length < 100) return null;

    page += 1;
  }
};

const existingUser = await findUserByEmail(adminEmail);
let adminUser = existingUser;

if (!adminUser) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      full_name: adminName,
      user_type: "admin",
      onboarding_completed: true,
    },
    app_metadata: {
      role: "admin",
    },
  });

  if (error) throw error;
  adminUser = data.user;
} else {
  const { data, error } = await supabase.auth.admin.updateUserById(adminUser.id, {
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      ...adminUser.user_metadata,
      full_name: adminUser.user_metadata?.full_name || adminName,
      user_type: "admin",
      onboarding_completed: true,
    },
    app_metadata: {
      ...adminUser.app_metadata,
      role: "admin",
    },
  });

  if (error) throw error;
  adminUser = data.user;
}

const { error: profileError } = await supabase.from("profiles").upsert(
  {
    user_id: adminUser.id,
    full_name: adminName,
    user_type: "admin",
  },
  { onConflict: "user_id" }
);

if (profileError) throw profileError;

const { error: roleError } = await supabase.from("user_roles").upsert(
  {
    user_id: adminUser.id,
    role: "admin",
  },
  { onConflict: "user_id,role" }
);

if (roleError) throw roleError;

console.log("Admin user is ready.");
console.log(`Email: ${adminEmail}`);
console.log(`User ID: ${adminUser.id}`);
