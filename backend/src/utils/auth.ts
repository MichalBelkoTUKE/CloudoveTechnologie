import { Request } from "express";
import { supabase } from "../services/supabase";

function getAccessToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

export async function getAuthenticatedUser(req: Request) {
  const token = getAccessToken(req);
  if (!token) {
    return { user: null, token: null, error: "Chýba autorizačný token" };
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return { user: null, token: null, error: "Neplatná session" };
  }

  return { user: data.user, token, error: null };
}
