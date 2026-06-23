import { Router } from "express";
import { attachUser } from "../middlewares/auth.middleware.js";
import { syncUser, getCurrentUser } from "../controller/auth.controller.js";

const router = Router();

// All auth routes require a valid Clerk session. `attachUser` validates the
// session (via getAuth) and loads the DB user, throwing 401 if not signed in.
router.post("/sync", attachUser, syncUser);
router.get("/me", attachUser, getCurrentUser);

export default router;
