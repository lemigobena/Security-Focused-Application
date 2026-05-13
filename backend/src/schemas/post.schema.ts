import { z } from 'zod';

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().max(255).optional(),
    body: z.string().optional(),
    fileId: z.union([z.number(), z.string()]).optional(),
  }).refine((data) => {
    const filledFields = [data.title, data.body, data.fileId].filter(
      (f) => f !== undefined && f !== null && f !== ''
    ).length;
    return filledFields >= 2;
  }, {
    message: "At least two fields (title, description, or file) must be filled.",
  }),
});
