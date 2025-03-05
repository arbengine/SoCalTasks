/**
 * As this file is reused in several other files, keep it lean. 
 * Avoid importing large npm packages or anything you won't need 
 * server-side or in the client.
 */

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage);
  }
  return v;
}

/**
 * We read the environment variables and throw if they're missing,
 * ensuring we don't accidentally deploy without them defined.
 */
export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET"
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID"
);

/**
 * See https://www.sanity.io/docs/api-versioning 
 * for how versioning works.
 */
export const apiVersion = 
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "1";

/**
 * Used to configure edit intent links, for 
 * "Open Preview/Edit" links, etc.
 */
export const studioUrl = 
  process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || "http://localhost:3333";
