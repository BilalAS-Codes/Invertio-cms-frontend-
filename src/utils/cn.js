import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Utility function to securely merge tailwind classes */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
