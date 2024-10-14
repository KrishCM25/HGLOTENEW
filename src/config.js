import { config } from "dotenv";
config();

export const PORT = process.env.PORT || 3000;
export const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb+srv://lotehg:ancash2001@lotehg.z03jr.mongodb.net/";
