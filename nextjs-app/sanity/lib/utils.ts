import createImageUrlBuilder from "@sanity/image-url";
import { Link } from "@/sanity.types";
import { dataset, projectId, studioUrl } from "@/sanity/lib/api";

// Create Sanity Image URL Builder
const imageBuilder = createImageUrlBuilder({
  projectId: projectId || "",
  dataset: dataset || "",
});

// Return the builder instance for flexible image transformations
export const urlForImage = (source: any) => {
  if (!source?.asset?._ref) {
    return undefined;
  }
  return imageBuilder.image(source);
};

// Helper for common image URL patterns with default formatting
export const urlForImageWithDefaults = (source: any) => {
  return urlForImage(source)?.auto("format").fit("max").url();
};

/**
 * Generates Open Graph metadata for social media sharing images.
 */
export function resolveOpenGraphImage(image: any, width = 1200, height = 627) {
  if (!image) return undefined;
  
  const url = urlForImage(image)?.width(width).height(height).fit("crop").url();
  
  if (!url) return undefined;

  return {
    url,
    alt: image?.alt || "Open Graph Image",
    width,
    height,
  };
}

/**
 * Resolves different types of links from Sanity content.
 */
export function linkResolver(link: Link | undefined) {
  if (!link) return null;

  // Default to 'href' if linkType is missing but href exists
  if (!link.linkType && link.href) {
    link.linkType = "href";
  }

  switch (link.linkType) {
    case "href":
      return link.href || null;
    case "page":
      if (link?.page && typeof link.page === "string") {
        return `/${link.page}`;
      }
      break;
    case "post":
      if (link?.post && typeof link.post === "string") {
        return `/posts/${link.post}`;
      }
      break;
    default:
      return null;
  }
}

/**
 * Sanity Studio Data Attribute Generator
 * Generates data attributes for Sanity Studio integration
 */
export function dataAttr(config: { id: string; type: string; path: string }) {
  return {
    "data-sanity-id": config.id,
    "data-sanity-type": config.type,
    "data-sanity-path": config.path,
  };
}