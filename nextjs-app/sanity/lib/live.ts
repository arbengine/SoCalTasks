import { createClient } from "next-sanity";
import { token } from "./token";

const projectId: string = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
const dataset: string = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion: string = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "1";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // ✅ Ensures fresh data from Sanity
  stega: {
    enabled: false,
    studioUrl: "/studio",
  },
});

/**
 * Fetches data from Sanity using GROQ queries.
 * @param query - The GROQ query string.
 * @param params - Optional parameters for the query.
 * @returns The fetched data or an empty array on failure.
 */
export const sanityFetch = async ({
  query,
  params = {},
}: {
  query: string;
  params?: Record<string, any>;
}) => {
  try {
    const result = await client.fetch(query, params, {
      next: {
        revalidate: 10, // ✅ Revalidates every 10 seconds to avoid stale data
      },
    });
    return result ?? []; // ✅ Ensures a valid return value
  } catch (error) {
    console.error("Sanity fetch error:", error);
    return []; // ✅ Prevents crashes
  }
};
