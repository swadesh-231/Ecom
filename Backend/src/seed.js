/**
 * Seed script — populates the database with sample products so the storefront
 * has something to show during development.
 *
 *   npm run seed
 *
 * Images use Unsplash URLs with a placeholder publicId (these are only deleted
 * from Cloudinary if a real publicId exists, so seeds are safe).
 */
import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./db/db.js";
import { Product } from "./models/product.model.js";

const img = (url) => ({ url, publicId: "" });

const products = [
  {
    name: "Classic White Sneakers",
    description:
      "Minimalist low-top sneakers crafted from premium leather with a cushioned insole for all-day comfort.",
    price: 4499,
    category: "Footwear",
    stock: 40,
    images: [img("https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800")],
  },
  {
    name: "Aviator Sunglasses",
    description: "Timeless aviator frames with UV400 polarized lenses and a lightweight metal body.",
    price: 1799,
    category: "Accessories",
    stock: 75,
    images: [img("https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800")],
  },
  {
    name: "Wireless Headphones",
    description: "Over-ear noise-cancelling headphones with 30-hour battery life and plush memory-foam cushions.",
    price: 12999,
    category: "Electronics",
    stock: 25,
    images: [img("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800")],
  },
  {
    name: "Leather Backpack",
    description: "Full-grain leather backpack with a padded laptop sleeve and antique brass hardware.",
    price: 6499,
    category: "Bags",
    stock: 18,
    images: [img("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800")],
  },
  {
    name: "Mechanical Keyboard",
    description: "Hot-swappable 75% mechanical keyboard with tactile switches and per-key RGB backlighting.",
    price: 8999,
    category: "Electronics",
    stock: 32,
    images: [img("https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800")],
  },
  {
    name: "Cotton Crewneck Tee",
    description: "Soft 100% organic cotton t-shirt with a relaxed fit and reinforced collar.",
    price: 799,
    category: "Apparel",
    stock: 120,
    images: [img("https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800")],
  },
  {
    name: "Stainless Steel Watch",
    description: "Automatic movement wristwatch with a sapphire crystal face and brushed steel bracelet.",
    price: 24999,
    category: "Accessories",
    stock: 12,
    images: [img("https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800")],
  },
  {
    name: "Ceramic Pour-Over Set",
    description: "Hand-glazed ceramic dripper and carafe set for the perfect morning brew.",
    price: 2499,
    category: "Home",
    stock: 28,
    images: [img("https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800")],
  },
];

const run = async () => {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products.`);
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
