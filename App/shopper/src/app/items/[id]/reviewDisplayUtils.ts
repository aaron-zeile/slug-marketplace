import type { Review } from '../../../item/review';

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length > 0) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return '?';
}

export function averageRating(reviews: Review[]): number {
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return sum / reviews.length;
}

export function formatAverage(value: number): string {
  return (Math.round(value * 10) / 10).toFixed(1);
}

export function prependReview(
  prev: Review[] | null,
  review: Review,
): Review[] {
  return prev ? [review, ...prev] : [review];
}

export function removeReview(
  prev: Review[] | null,
  reviewId: string,
): Review[] {
  return (prev ?? []).filter((review) => review.id !== reviewId);
}
