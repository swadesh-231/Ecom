import { getAuth, clerkClient } from "@clerk/express";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Ensures the request carries a valid Clerk session, then loads (or lazily
 * creates) the matching MongoDB user and attaches it as `req.user`.
 *
 * Use after Clerk's `requireAuth()` on any route that needs the DB user.
 */
export const attachUser = asyncHandler(async (req, res, next) => {
  const { userId } = getAuth(req);

  if (!userId) {
    throw new ApiError(401, "Unauthorized — please sign in");
  }

  let user = await User.findOne({ clerkId: userId });

  // First time we've seen this Clerk user — mirror them into our database.
  if (!user) {
    const clerkUser = await clerkClient.users.getUser(userId);
    const email =
      clerkUser.primaryEmailAddress?.emailAddress ??
      clerkUser.emailAddresses?.[0]?.emailAddress;
    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.username ||
      "Customer";

    user = await User.create({
      clerkId: userId,
      email,
      name,
      avatar: clerkUser.imageUrl,
    });
  }

  req.user = user;
  next();
});
