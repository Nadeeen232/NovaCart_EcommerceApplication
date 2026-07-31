import { Router } from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { protect, adminOnly } from "../middleware/auth.js";
const router = Router();
router.get("/meta/categories", async (_req, res) =>
  res.json(await Category.find({ isActive: true }).sort({ displayOrder: 1 })),
);
router.get("/meta/filters", async (_req, res) => {
  const [categories, brands, range] = await Promise.all([
    Category.find({ isActive: true })
      .select("name slug")
      .sort({ displayOrder: 1 }),
    Product.distinct("brand", { isActive: true }),
    Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } },
      },
    ]),
  ]);
  res.json({
    categories,
    brands: brands.sort(),
    priceRange: range[0] || { min: 0, max: 0 },
  });
});
router.get("/", async (req, res) => {
  const q = { isActive: true };
  if (req.query.category) q.category = req.query.category;
  if (req.query.brand) q.brand = req.query.brand;
  if (req.query.trending === "true") q.trending = true;
  if (req.query.search?.trim()) q.$text = { $search: req.query.search.trim() };
  if (req.query.minPrice || req.query.maxPrice) {
    q.price = {};
    if (req.query.minPrice) q.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) q.price.$lte = Number(req.query.maxPrice);
  }
  const sorts = {
    newest: { createdAt: -1 },
    priceAsc: { price: 1 },
    priceDesc: { price: -1 },
    rating: { rating: -1 },
    popular: { soldCount: -1 },
  };
  res.json(
    await Product.find(q)
      .sort(
        sorts[req.query.sort] || { featured: -1, trending: -1, createdAt: -1 },
      )
      .limit(100),
  );
});
router.get("/:id", async (req, res) => {
  const or = [{ slug: req.params.id }];
  if (mongoose.isValidObjectId(req.params.id)) or.push({ _id: req.params.id });
  const p = await Product.findOne({ $or: or, isActive: true });
  return p
    ? res.json(p)
    : res.status(404).json({ message: "Product not found" });
});
router.post("/", protect, adminOnly, async (req, res) =>
  res.status(201).json(await Product.create(req.body)),
);
router.put("/:id", protect, adminOnly, async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  return p
    ? res.json(p)
    : res.status(404).json({ message: "Product not found" });
});
router.delete("/:id", protect, adminOnly, async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, { isActive: false });
  return p
    ? res.status(204).end()
    : res.status(404).json({ message: "Product not found" });
});
export default router;
