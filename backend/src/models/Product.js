import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sku: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0, default: null },
    category: { type: String, required: true, index: true },
    categoryRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      index: true,
    },
    brand: { type: String, required: true, index: true },
    image: { type: String, required: true },
    images: [String],
    stock: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    tags: [String],
    colors: [String],
    specifications: { type: Map, of: String, default: {} },
    trending: { type: Boolean, default: false, index: true },
    featured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    soldCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true } },
);
schema.index({
  name: "text",
  description: "text",
  brand: "text",
  tags: "text",
});
schema.index({ category: 1, price: 1, createdAt: -1 });
schema.virtual("inStock").get(function () {
  return this.stock > 0;
});
schema.virtual("discountPercent").get(function () {
  return this.compareAtPrice > this.price
    ? Math.round(
        ((this.compareAtPrice - this.price) / this.compareAtPrice) * 100,
      )
    : 0;
});
export default mongoose.model("Product", schema);
