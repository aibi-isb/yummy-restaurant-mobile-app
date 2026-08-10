import { supabase } from "@/lib/supabase";

export async function isUsernameAvailable(username: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username.trim().toLowerCase())
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;
  return !data;
}

export async function registerCustomer({
  address,
  email,
  fullName,
  password,
  phone,
  username,
}: {
  address: string;
  email: string;
  fullName: string;
  password: string;
  phone: string;
  username: string;
}) {
  if (!(await isUsernameAvailable(username))) {
    throw new Error("Username is already taken.");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        address,
        full_name: fullName,
        phone,
        role: "customer",
        username: username.trim().toLowerCase(),
      },
    },
  });

  if (error) throw error;

  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      email,
      full_name: fullName,
      address,
      phone,
      username: username.trim().toLowerCase(),
      role: "customer",
    });

    if (profileError) throw profileError;
  }

  return data;
}

export async function signInWithIdentifier(identifier: string, password: string) {
  let email = identifier.trim();

  if (!email.includes("@")) {
    const { data, error } = await supabase
      .rpc("resolve_login_email", { login_username: email.toLowerCase() });

    if (error) throw error;
    if (typeof data !== "string" || !data) {
      throw new Error("No account found for that username.");
    }
    email = data;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}
