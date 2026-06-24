// Loads environment variables from the single root .env (the repo root, one
// level above /Backend) so the whole app — backend at runtime and frontend at
// build time — shares ONE env file.
//
// This must be imported before anything that reads process.env (see index.js).
// On Render there is no .env file; the variables come from the dashboard and
// dotenv simply finds no file and does nothing (it never overrides real env
// vars), so the same code works locally and in production.
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
