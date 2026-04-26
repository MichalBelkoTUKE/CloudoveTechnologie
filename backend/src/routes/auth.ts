import { Router, Request, Response } from "express";
import { supabase } from "../services/supabase";
import { getAuthenticatedUser } from "../utils/auth";

const router = Router();

router.post("/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    res.status(400).json({ error: "Email a heslo sú povinné" });
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    res.status(401).json({ error: error.message });
    return;
  }

  res.json({ user: data.user, session: data.session });
});

router.post("/signup", async (req: Request, res: Response) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    res.status(400).json({ error: "Email a heslo sú povinné" });
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.status(201).json({ user: data.user, session: data.session });
});

router.get("/me", async (req: Request, res: Response) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth.user) {
    res.status(401).json({ error: auth.error });
    return;
  }

  res.json({ user: auth.user });
});

router.post("/signout", async (_req: Request, res: Response) => {
  // Session is removed client-side, this endpoint keeps a uniform auth API.
  res.status(204).send();
});

router.post("/reset-password", async (req: Request, res: Response) => {
  const { email, redirectTo } = req.body as {
    email?: string;
    redirectTo?: string;
  };

  if (!email) {
    res.status(400).json({ error: "Email je povinný" });
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.status(204).send();
});

router.post("/update-password", async (req: Request, res: Response) => {
  const { password } = req.body as { password?: string };
  if (!password || password.length < 6) {
    res.status(400).json({ error: "Heslo musí mať aspoň 6 znakov" });
    return;
  }

  const auth = await getAuthenticatedUser(req);
  if (!auth.user) {
    res.status(401).json({ error: auth.error });
    return;
  }

  const { data, error } = await supabase.auth.admin.updateUserById(
    auth.user.id,
    {
      password,
    },
  );

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json({ user: data.user });
});

export default router;
