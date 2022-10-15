import { z } from 'zod';

export const advancedSearchFormSchema = z.object({
  taxon_group: z.string().optional(),
  classificationHierarchies: z.array(z.string()).optional(),
  is_endemic: z.string().optional(),
  alien_type: z.string().optional(),
  is_terrestrial: z.string().optional(),
  protected_category: z.string().optional(),
  red_category: z.string().optional(),
  iucn_category: z.string().optional(),
  cites: z.string().optional(),
  date: z.string().optional(),
})
