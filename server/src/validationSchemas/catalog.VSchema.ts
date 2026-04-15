import { z } from "zod";

export const objectIdParam = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid id");

export const categoryListQuerySchema = z.object({
  active: z
    .enum(["true", "false", "all"])
    .optional()
    .default("all")
    .transform((v) => (v === "all" ? undefined : v === "true")),
  limit: z.coerce.number().int().min(1).max(200).default(100),
  skip: z.coerce.number().int().min(0).default(0),
});

export type CategoryListQuery = z.infer<typeof categoryListQuerySchema>;

export const categoryIdParamsSchema = z.object({
  categoryId: objectIdParam,
});

export type CategoryIdParams = z.infer<typeof categoryIdParamsSchema>;

export const categoryCreateBodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().max(5000).optional().default(""),
  active: z.boolean().optional().default(true),
});

export type CategoryCreateBody = z.infer<typeof categoryCreateBodySchema>;

export const categoryPatchBodySchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    description: z.string().max(5000).optional(),
    active: z.boolean().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: "At least one field required" });

export type CategoryPatchBody = z.infer<typeof categoryPatchBodySchema>;

export const productListQuerySchema = z.object({
  categoryId: objectIdParam.optional(),
  active: z
    .enum(["true", "false", "all"])
    .optional()
    .default("all")
    .transform((v) => (v === "all" ? undefined : v === "true")),
  search: z.string().trim().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
  skip: z.coerce.number().int().min(0).default(0),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

export const productIdParamsSchema = z.object({
  productId: objectIdParam,
});

export type ProductIdParams = z.infer<typeof productIdParamsSchema>;

export const productColorParamsSchema = z.object({
  productId: objectIdParam,
  colorId: objectIdParam,
});

export type ProductColorParams = z.infer<typeof productColorParamsSchema>;

const sizeString = z.string().trim().min(1).max(32);

export const productCreateBodySchema = z.object({
  categoryId: objectIdParam,
  name: z.string().trim().min(1).max(300),
  description: z.string().max(10000).optional().default(""),
  occasions: z.array(z.string().trim().max(80)).max(50).optional().default([]),
  fabric: z.string().trim().max(200).optional().default(""),
  basePrice: z.coerce.number().min(0).max(1e9),
  currency: z.string().trim().min(1).max(10).optional().default("NPR"),
  allowedSizes: z.array(sizeString).max(50).optional().default([]),
  active: z.boolean().optional().default(true),
  sortOrder: z.coerce.number().int().min(0).max(1_000_000).optional().default(0),
});

export type ProductCreateBody = z.infer<typeof productCreateBodySchema>;

export const productPatchBodySchema = z
  .object({
    categoryId: objectIdParam.optional(),
    name: z.string().trim().min(1).max(300).optional(),
    description: z.string().max(10000).optional(),
    occasions: z.array(z.string().trim().max(80)).max(50).optional(),
    fabric: z.string().trim().max(200).optional(),
    basePrice: z.coerce.number().min(0).max(1e9).optional(),
    currency: z.string().trim().min(1).max(10).optional(),
    allowedSizes: z.array(sizeString).max(50).optional(),
    active: z.boolean().optional(),
    sortOrder: z.coerce.number().int().min(0).max(1_000_000).optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: "At least one field required" });

export type ProductPatchBody = z.infer<typeof productPatchBodySchema>;

export const productColorCreateBodySchema = z.object({
  colorName: z.string().trim().min(1).max(200),
  colorNameEn: z.string().trim().max(200).optional().default(""),
  imageUrl: z.string().trim().min(1).max(2000),
  active: z.boolean().optional().default(true),
  sortOrder: z.coerce.number().int().min(0).max(1_000_000).optional().default(0),
});

export type ProductColorCreateBody = z.infer<typeof productColorCreateBodySchema>;

export const productColorPatchBodySchema = z
  .object({
    colorName: z.string().trim().min(1).max(200).optional(),
    colorNameEn: z.string().trim().max(200).optional(),
    imageUrl: z.string().trim().min(1).max(2000).optional(),
    active: z.boolean().optional(),
    sortOrder: z.coerce.number().int().min(0).max(1_000_000).optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: "At least one field required" });

export type ProductColorPatchBody = z.infer<typeof productColorPatchBodySchema>;

export const variantStockPutBodySchema = z.object({
  items: z
    .array(
      z.object({
        size: sizeString,
        price: z.coerce.number().min(0).max(1e9).nullable().optional(),
        stock: z.coerce.number().int().min(0).max(1e9),
        isAvailable: z.boolean(),
        lowStockThreshold: z.coerce.number().int().min(0).max(1e9).nullable().optional(),
        sku: z.string().trim().max(120).nullable().optional(),
        active: z.boolean().optional().default(true),
      }),
    )
    .max(100),
});

export type VariantStockPutBody = z.infer<typeof variantStockPutBodySchema>;

const colorClientKey = z.string().uuid();

export const productColorDraftSchema = z.object({
  clientKey: colorClientKey,
  colorName: z.string().trim().min(1).max(200),
  colorNameEn: z.string().trim().max(200).optional().default(""),
  imageUrl: z.string().trim().min(1).max(2000),
  active: z.boolean().optional().default(true),
});

export const productCreateFullBodySchema = z
  .object({
    categoryId: objectIdParam,
    name: z.string().trim().min(1).max(300),
    description: z.string().max(10000).optional().default(""),
    occasions: z.array(z.string().trim().max(80)).max(50).optional().default([]),
    fabric: z.string().trim().max(200).optional().default(""),
    basePrice: z.coerce.number().min(0).max(1e9),
    currency: z.string().trim().min(1).max(10).optional().default("NPR"),
    allowedSizes: z.array(sizeString).min(1).max(50),
    active: z.boolean().optional().default(true),
    sortOrder: z.coerce.number().int().min(0).max(1_000_000).optional().default(0),
    colors: z.array(productColorDraftSchema).min(1).max(40),
    combinations: z
      .array(
        z.object({
          colorClientKey: colorClientKey,
          size: sizeString,
          price: z.coerce.number().min(0).max(1e9),
          stock: z.coerce.number().int().min(0).max(1e9).default(0),
          isAvailable: z.boolean().default(true),
          lowStockThreshold: z.coerce.number().int().min(0).nullable().optional(),
          sku: z.string().trim().max(120).nullable().optional(),
          active: z.boolean().optional().default(true),
        }),
      )
      .min(1)
      .max(500),
  })
  .superRefine((data, ctx) => {
    const sizeSet = new Set(data.allowedSizes);
    if (sizeSet.size !== data.allowedSizes.length) {
      ctx.addIssue({
        code: "custom",
        path: ["allowedSizes"],
        message: "Duplicate sizes are not allowed",
      });
      return;
    }
    const keySet = new Set(data.colors.map((c) => c.clientKey));
    if (keySet.size !== data.colors.length) {
      ctx.addIssue({
        code: "custom",
        path: ["colors"],
        message: "Duplicate color clientKey",
      });
      return;
    }
    const expected = data.allowedSizes.length * data.colors.length;
    if (data.combinations.length !== expected) {
      ctx.addIssue({
        code: "custom",
        path: ["combinations"],
        message: `Expected ${expected} combination rows (sizes × colors), got ${data.combinations.length}`,
      });
      return;
    }
    const seen = new Set<string>();
    for (let i = 0; i < data.combinations.length; i++) {
      const row = data.combinations[i];
      if (!keySet.has(row.colorClientKey)) {
        ctx.addIssue({
          code: "custom",
          path: ["combinations", i, "colorClientKey"],
          message: "Unknown colorClientKey",
        });
      }
      if (!sizeSet.has(row.size)) {
        ctx.addIssue({
          code: "custom",
          path: ["combinations", i, "size"],
          message: "size must be one of allowedSizes",
        });
      }
      const sig = `${row.colorClientKey}::${row.size}`;
      if (seen.has(sig)) {
        ctx.addIssue({
          code: "custom",
          path: ["combinations", i],
          message: "Duplicate color × size combination",
        });
      }
      seen.add(sig);
    }
    for (const col of data.colors) {
      for (const sz of data.allowedSizes) {
        if (!seen.has(`${col.clientKey}::${sz}`)) {
          ctx.addIssue({
            code: "custom",
            path: ["combinations"],
            message: `Missing combination for color key and size ${sz}`,
          });
          return;
        }
      }
    }
  });

export type ProductCreateFullBody = z.infer<typeof productCreateFullBodySchema>;
