// sanity/lib/queries.ts
import { groq } from "next-sanity";

/**
 * Fetch site settings
 */
export const settingsQuery = groq`*[_type == "settings"][0]`;

/**
 * Fetch a single post by slug
 */
export const postQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    content,
    excerpt,
    coverImage {
      asset-> {
        url,
        metadata {
          dimensions {
            width,
            height,
            aspectRatio
          }
        }
      },
      alt
    },
    videoEmbed {
      url
    },
    date,
    author->,
    categories[]->
  }
`;

/**
 * Fetches all posts (used for full list)
 */
export const allPostsQuery = groq`
  *[_type == "post"] | order(date desc, _updatedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    coverImage {
      asset-> {
        url,
        metadata {
          dimensions {
            width,
            height,
            aspectRatio
          }
        }
      },
      alt
    },
    videoEmbed {
      url
    },
    date,
    author->,
    categories[]->
  }
`;

/**
 * Fetches posts for pagination (with limit + offset)
 */
export const morePostsQuery = groq`
  *[_type == "post"] | order(date desc, _updatedAt desc) [$skip...$limit] {
    _id,
    title,
    slug,
    excerpt,
    coverImage {
      asset-> {
        url,
        metadata {
          dimensions {
            width,
            height,
            aspectRatio
          }
        }
      },
      alt
    },
    videoEmbed {
      url
    },
    date,
    author->,
    categories[]->
  }
`;