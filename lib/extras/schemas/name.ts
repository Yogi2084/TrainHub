import { z } from "zod";

export const nameSchema = z
  .string()
  .min(1, "Name needs to have at least 1 characters");
