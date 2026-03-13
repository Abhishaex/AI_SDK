import { z } from "zod";

/** Single ingredient. Use empty string for amount/unit when not applicable. */
export const recipeIngredientSchema = z.object({
  name: z.string().describe("Ingredient name"),
  amount: z.string().describe("Quantity or amount, e.g. 2, 1/2; use empty string if N/A"),
  unit: z.string().describe("Unit of measure, e.g. cups, tbsp, g; use empty string if N/A"),
});

/** Full dish recipe schema for structured AI output. Use empty string/array when N/A. */
export const dishRecipeSchema = z.object({
  name: z.string().describe("Name of the dish"),
  description: z.string().describe("Short description of the dish"),
  cuisine: z.string().describe("Cuisine type, e.g. Italian, Mexican; use empty string if N/A"),
  prepTimeMinutes: z.number().min(0).describe("Preparation time in minutes"),
  cookTimeMinutes: z.number().min(0).describe("Cooking time in minutes"),
  servings: z.number().min(1).describe("Number of servings"),
  ingredients: z
    .array(recipeIngredientSchema)
    .min(1)
    .describe("List of ingredients with amounts"),
  instructions: z
    .array(z.string())
    .min(1)
    .describe("Step-by-step cooking instructions"),
  tags: z.array(z.string()).describe("Tags e.g. vegetarian, quick; use empty array if N/A"),
});

export type RecipeIngredient = z.infer<typeof recipeIngredientSchema>;
export type DishRecipe = z.infer<typeof dishRecipeSchema>;
