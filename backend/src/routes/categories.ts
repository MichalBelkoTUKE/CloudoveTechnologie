import { Router, Request, Response } from "express";
import { supabase } from "../services/supabase";
import { getAuthenticatedUser } from "../utils/auth";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth.user) {
    res.status(401).json({ error: auth.error });
    return;
  }

  const userId = auth.user.id;

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId);
  if (categoriesError) {
    res.status(500).json({ error: categoriesError.message });
    return;
  }

  const { data: receipts, error: receiptsError } = await supabase
    .from("receipts")
    .select("category_id, total_amount")
    .eq("user_id", userId);
  if (receiptsError) {
    res.status(500).json({ error: receiptsError.message });
    return;
  }

  const enriched = (categories ?? []).map((category) => {
    const related = (receipts ?? []).filter(
      (receipt) => receipt.category_id === category.id,
    );
    const totalSpent = related.reduce(
      (sum, receipt) => sum + (receipt.total_amount ?? 0),
      0,
    );
    return {
      ...category,
      receipts_count: related.length,
      total_spent: totalSpent,
    };
  });

  res.json(enriched);
});

router.post("/", async (req: Request, res: Response) => {
  const auth = await getAuthenticatedUser(req);
  if (!auth.user) {
    res.status(401).json({ error: auth.error });
    return;
  }

  const userId = auth.user.id;

  const { name, color } = req.body as { name?: string; color?: string };
  if (!name?.trim()) {
    res.status(400).json({ error: "Názov kategórie je povinný" });
    return;
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({
      user_id: userId,
      name: name.trim(),
      color: color ?? "bg-blue-500",
    })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.status(201).json(data);
});

router.delete("/:id", async (req: Request, res: Response) => {
  const auth = await getAuthenticatedUser(req);
  const { id } = req.params;
  if (!auth.user) {
    res.status(401).json({ error: auth.error });
    return;
  }

  const userId = auth.user.id;

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.status(204).send();
});

export default router;
