// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import 'easymde/dist/easymde.min.css';
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import * as demo from "@/sanity/lib/demo";
import { sanityFetch } from "@/sanity/lib/live";
import { settingsQuery } from "@/sanity/lib/queries";
import { resolveOpenGraphImage } from "@/sanity/lib/utils";

const defaultMetadata = {
  title: "DoItYourself.bot - Your AI-Powered DIY Guide",
  description: "Discover step-by-step DIY guides, projects, and tutorials for woodworking, home decor, gardening, and crafts. Get AI-powered assistance for your next DIY project.",
  metadataBase: new URL('https://doityourself.bot'),
} as const;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const result = await sanityFetch({ query: settingsQuery });
    const settings = result || {};
    
    const title = settings?.title || defaultMetadata.title;
    const description = settings?.description || defaultMetadata.description;
    const ogImage = resolveOpenGraphImage(settings?.ogImage);
    
    return {
      metadataBase: new URL('https://doityourself.bot'),
      title: {
        template: `%s | ${title}`,
        default: title,
      },
      description,
      keywords: [
        'DIY projects',
        'DIY tutorials',
        'woodworking',
        'home decor',
        'gardening',
        'crafts',
        'DIY guide',
        'home improvement',
        'DIY bot',
        'AI DIY assistant'
      ],
      authors: [{ name: "DoItYourself.bot" }],
      creator: "DoItYourself.bot",
      publisher: "DoItYourself.bot",
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://doityourself.bot',
        siteName: title,
        title,
        description,
        images: ogImage ? [ogImage] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        creator: '@doityourselfbot',
        site: '@doityourselfbot',
        images: ogImage ? [ogImage] : [],
      },
      icons: {
        icon: [
          { url: '/favicon.svg', type: 'image/svg+xml' },
          { url: '/favicon.ico', sizes: '32x32' }
        ],
        shortcut: '/favicon.svg',
        apple: [
          { url: '/favicon.svg', type: 'image/svg+xml' }
        ],
      },
      manifest: '/site.webmanifest',
      other: {
        'format-detection': 'telephone=no, address=no, email=no',
      },
    };
  } catch (error) {
    console.error("Failed to fetch metadata from Sanity:", error);
    return defaultMetadata;
  }
}

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} bg-white text-black`}>
      <body className="min-h-screen bg-white">
        <section className="min-h-screen pt-24">
          <Toaster />
          <Header />
          <main>{children}</main>
          <Footer />
        </section>
      </body>
    </html>
  );
}