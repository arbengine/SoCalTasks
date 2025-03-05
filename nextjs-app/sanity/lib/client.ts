/**
 * The main Sanity client for reading data.
 * 
 * If using `next-sanity`:
 *   npm install next-sanity
 * Then import { createClient } from 'next-sanity'.
 * 
 * If using the official `@sanity/client`:
 *   npm install @sanity/client
 * Then import { createClient } from '@sanity/client'.
 */

import { createClient } from 'next-sanity' 
// or: import { createClient } from '@sanity/client'

import { 
  projectId, 
  dataset, 
  apiVersion, 
  studioUrl 
} from './api'

export const client = createClient({
  projectId: projectId,
  dataset: dataset,
  apiVersion: apiVersion, // Sanity API versioning (default: latest)
  useCdn: process.env.NODE_ENV === "production", // Use CDN in production for faster reads
  token: process.env.SANITY_API_TOKEN || "", // Optional: Set a token for authenticated requests
  stega: {
    studioUrl: studioUrl,
    filter: (props: any) => {
      return props.sourcePath.at(-1) === "title" || props.filterDefault(props);
    },
  },
});
