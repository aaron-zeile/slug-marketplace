'use server';
import { getItem } from '../../../item/service';

export async function fetchItemAction(id: string) {
  try {
    const item = await getItem(id);
    return { success: true, data: item };
  } catch (error) {
    const message = error instanceof Error && error.message;
    return { success: false, error: message };
  }
}
