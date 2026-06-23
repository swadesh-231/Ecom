import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // Cloudinary-hosted images. The first entry is treated as the cover image.
    // publicId is only present for images we uploaded to Cloudinary (needed for
    // deletion); external/seeded image URLs may leave it empty.
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: "" },
      },
    ],

    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Allow simple text search on name + description.
productSchema.index({ name: "text", description: "text" });

export const Product = mongoose.model("Product", productSchema);
