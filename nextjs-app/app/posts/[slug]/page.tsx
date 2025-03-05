// app/posts/[slug]/page.tsx
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Roboto } from 'next/font/google';
import { sanityFetch } from "@/sanity/lib/live";
import { postQuery } from "@/sanity/lib/queries";
import { MarkdownContent } from "@/app/components/MarkdownContent";

// Initialize Roboto font
const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

interface Block {
  children?: { text: string }[];
}

interface Post {
  _id?: string;
  title?: string;
  excerpt?: string;
  slug?: { current?: string };
  content?: Block[] | string;
  coverImage?: { asset?: { url?: string } };
  videoEmbed?: { url?: string };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post: Post = await sanityFetch({ query: postQuery, params });

  return {
    title: post?.title || "Untitled Post",
    description: post?.excerpt || "No description",
  };
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post: Post = await sanityFetch({ query: postQuery, params });

  if (!post?._id) {
    return notFound();
  }

  // Convert block content to markdown string if needed
  const markdownContent =
    Array.isArray(post.content)
      ? post.content
          .map((block: Block) => block.children?.map((child) => child.text).join("") || "")
          .join("\n\n")
      : post.content || "";

  return (
    <div className={`min-h-screen bg-white py-8 flex justify-center ${roboto.className}`}>
      <article className="w-full max-w-3xl px-4 md:px-8 lg:px-12 text-left">
        {/* Cover Image */}
        {post.coverImage?.asset?.url && (
          <div className="relative w-full h-[150px] mb-6 overflow-hidden rounded-lg">
            <Image
              src={post.coverImage.asset.url}
              alt={post.title || "Post Image"}
              fill
              className="object-cover object-center"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
            />
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl font-medium text-center mb-4">{post.title}</h1>

        {/* Subtitle/Excerpt */}
        {post.excerpt && (
          <p className="text-gray-600 text-base italic text-center mb-8">
            {post.excerpt}
          </p>
        )}

        {/* Embedded Video */}
        {post.videoEmbed?.url && (
          <div className="relative w-full pb-[56.25%] mb-6">
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              src={
                post.videoEmbed.url.includes("watch?v=")
                  ? post.videoEmbed.url.replace("watch?v=", "embed/")
                  : post.videoEmbed.url
              }
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        )}

        {/* Markdown Content */}
        <div className="prose prose-lg max-w-none prose-headings:font-roboto prose-p:font-roboto prose-a:text-blue-600">
          <MarkdownContent content={markdownContent} />
        </div>
      </article>
    </div>
  );
}