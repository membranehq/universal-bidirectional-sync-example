import pluralize, { isPlural } from "pluralize";

/**
 * Utility functions for handling pluralization and singularization
 */

/**
 * Converts a plural word to its singular form
 * @param word - The word to singularize
 * @returns The singular form of the word
 */
export function singularize(word: string): string {
  return pluralize.singular(word);
}


/**
 * Checks if a word is singular
 * @param word - The word to check
 * @returns True if the word is singular, false otherwise
 */
export function isSingular(word: string): boolean {
  return pluralize.isSingular(word);
}

/**
 * Gets the singular form of a word, handling edge cases
 * @param word - The word to singularize
 * @returns The singular form, or the original word if it's already singular
 */
export function getSingularForm(word: string): string {
  if (isSingular(word)) {
    return word;
  }
  return singularize(word);
}

export function getPluralForm(word: string): string {
  if (isPlural(word)) {
    return word;
  }
  return pluralize(word);
}