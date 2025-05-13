import { z } from 'genkit';

// Define the schema for the nutritional information
export const NutritionInfoSchema = z.object({
  calories: z.string().describe('Total calories per serving e.g. "450 kcal"'),
  protein: z.string().describe('Protein content per serving e.g. "15g"'),
  fat: z.object({
    total: z.string().describe('Total fat content per serving e.g. "20g"'),
    saturated: z.string().describe('Saturated fat content per serving e.g. "5g"'),
    unsaturated: z.string().optional().describe('Unsaturated fat content per serving e.g. "15g"')
  }),
  carbohydrates: z.object({
    total: z.string().describe('Total carbohydrates per serving e.g. "40g"'),
    fiber: z.string().describe('Dietary fiber content per serving e.g. "8g"'),
    sugar: z.string().describe('Sugar content per serving e.g. "10g"')
  }),
  sodium: z.string().describe('Sodium content per serving e.g. "500mg"'),
  vitamins: z.array(z.object({
    name: z.string().describe('Name of the vitamin'),
    amount: z.string().describe('Amount of the vitamin with unit'),
    dailyValue: z.string().optional().describe('Percentage of daily recommended value')
  })).optional(),
  minerals: z.array(z.object({
    name: z.string().describe('Name of the mineral'),
    amount: z.string().describe('Amount of the mineral with unit'),
    dailyValue: z.string().optional().describe('Percentage of daily recommended value')
  })).optional(),
  servingSize: z.string().describe('Serving size e.g. "1 cup" or "250g"').optional(),
});

export type NutritionInfo = z.infer<typeof NutritionInfoSchema>; 