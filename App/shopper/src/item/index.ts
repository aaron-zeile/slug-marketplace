import * as z from 'zod';
import { ItemSchema } from '../shared/item';

export type Item = z.infer<typeof ItemSchema>;
