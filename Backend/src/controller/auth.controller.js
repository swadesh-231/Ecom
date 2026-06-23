import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * POST /api/v1/auth/sync
 * Called by the frontend right after Clerk sign-in. `attachUser` has already
 * created/loaded the DB user, so we just return it (with role) to the client.
 */
export const syncUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User synced"));
});

/**
 * GET /api/v1/auth/me
 * Returns the currently authenticated user's profile + role.
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched"));
});
