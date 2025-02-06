// app/components/Posts.tsx
import Link from "next/link";
import Image from "next/image";
import { sanityFetch } from "@/sanity/lib/live";
import { allPostsQuery } from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/utils";

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  date: string;
  coverImage?: {
    asset: {
      url: string;
    };
    alt?: string;
  };
}

// Post Component
const PostComponent = ({ post }: { post: Post }) => {
  const { _id, title, slug, excerpt, date, coverImage } = post;

  return (
    <article key={_id} className="flex flex-col bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/posts/${slug.current}`} className="group">
        {coverImage?.asset?.url && (
          <div className="relative h-48 overflow-hidden">
            <Image
              src={urlForImage(coverImage)?.url() || coverImage.asset.url}
              alt={coverImage.alt || title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(min-width: 1280px) 384px, (min-width: 1040px) 288px, (min-width: 780px) 384px, 100vw"
            />
          </div>
        )}
        <div className="p-4">
          <time className="text-sm text-gray-500">
            {new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>

          <h3 className="mt-2 text-xl font-semibold text-gray-900 group-hover:text-orange-500 transition-colors">
            {title}
          </h3>

          {excerpt && (
            <p className="mt-2 text-gray-600 line-clamp-2">
              {excerpt}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
};

// Posts Grid Component
const PostsGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {children}
  </div>
);

// Fetch all posts
export async function AllPosts() {
  const result = await sanityFetch({ query: allPostsQuery });
  const posts = (Array.isArray(result) ? result : []) as Post[];

  if (!posts?.length) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">No posts yet</h2>
        <p className="mt-2 text-gray-600">
          Create your first post in Sanity Studio to get started.
        </p>
      </div>
    );
  }

  return (
    <PostsGrid>
      {posts.map((post) => (
        <PostComponent key={post._id} post={post} />
      ))}
    </PostsGrid>
  );
}