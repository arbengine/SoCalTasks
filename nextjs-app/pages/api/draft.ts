import { redirect } from 'next/navigation'
import { draftMode } from 'next/headers'
//hi haha//
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug')

  if (secret !== process.env.SANITY_PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 })
  }

  if (!slug) {
    return new Response('No slug in query string', { status: 401 })
  }

  // Fix: Await draftMode() before calling .enable()
  const draft = await draftMode()
  draft.enable()

  // Redirect to the path from the fetched post
  return redirect(`/posts/${slug}`)
}
