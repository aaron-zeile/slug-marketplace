import * as z from 'zod';
import { ReviewSchema } from '../../shared/review';

export type Review = z.infer<typeof ReviewSchema>;
