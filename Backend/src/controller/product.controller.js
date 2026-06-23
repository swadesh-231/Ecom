import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../config/cloudnary.js";

/**
 * GET /api/v1/products
 * Public listing with optional search, category, price range, sort & pagination.
 */
export const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    sort = "newest",
    page = 1,
    limit = 12,
  } = req.query;

  const filter = { isActive: true };

  if (category) filter.category = category;
  if (search) filter.$text = { $search: search };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    newest: { createdAt: -1 },
    priceLow: { price: 1 },
    priceHigh: { price: -1 },
    topRated: { ratings: -1 },
  };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Math.min(50, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortMap[sort] || sortMap.newest)
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      products,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    }),
  );
});

/** GET /api/v1/products/categories — distinct category list for filters/nav. */
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct("category", { isActive: true });
  return res.status(200).json(new ApiResponse(200, categories));
});

/** GET /api/v1/products/:id */
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");
  return res.status(200).json(new ApiResponse(200, product));
});

/**
 * POST /api/v1/products  (admin)
 * Accepts multipart/form-data with text fields + up to 5 `images` files.
 */
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock } = req.body;

  if (!name || !description || price === undefined || !category) {
    throw new ApiError(400, "name, description, price and category are required");
  }

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "At least one product image is required");
  }

  const images = await Promise.all(
    req.files.map((file) => uploadToCloudinary(file.buffer, "ecom/products")),
  );

  const product = await Product.create({
    name,
    description,
    price: Number(price),
    category,
    stock: stock !== undefined ? Number(stock) : 0,
    images,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created"));
});

/**
 * PATCH /api/v1/products/:id  (admin)
 * Updates text fields and optionally appends newly uploaded images.
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  const { name, description, price, category, stock, isActive } = req.body;

  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = Number(price);
  if (category !== undefined) product.category = category;
  if (stock !== undefined) product.stock = Number(stock);
  if (isActive !== undefined) product.isActive = isActive === "true" || isActive === true;

  if (req.files && req.files.length > 0) {
    const newImages = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer, "ecom/products")),
    );
    product.images.push(...newImages);
  }

  await product.save();

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated"));
});

/** DELETE /api/v1/products/:id  (admin) — also cleans up Cloudinary images. */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  await Promise.all(
    product.images.map((img) => deleteFromCloudinary(img.publicId)),
  );
  await product.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, { id: req.params.id }, "Product deleted"));
});
