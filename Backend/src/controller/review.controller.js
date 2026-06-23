import { Review } from "../models/review.model.js";
import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/** Recompute a product's average rating and review count from its reviews. */
const recalcProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { productId } },
    {
      $group: {
        _id: "$productId",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const { avg = 0, count = 0 } = stats[0] || {};
  await Product.findByIdAndUpdate(productId, {
    ratings: Math.round(avg * 10) / 10,
    numReviews: count,
  });
};

/** GET /api/v1/reviews/:productId — public list of a product's reviews. */
export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ productId: req.params.productId }).sort({
    createdAt: -1,
  });
  return res.status(200).json(new ApiResponse(200, reviews));
});

/** POST /api/v1/reviews/:productId  (auth) — create/replace your review. */
export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const { productId } = req.params;

  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }
  if (!comment) throw new ApiError(400, "Comment is required");

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  // Upsert so a user updating their review doesn't trip the unique index.
  const review = await Review.findOneAndUpdate(
    { productId, userId: req.user._id },
    {
      productId,
      userId: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  await recalcProductRating(product._id);

  return res
    .status(201)
    .json(new ApiResponse(201, review, "Review submitted"));
});
