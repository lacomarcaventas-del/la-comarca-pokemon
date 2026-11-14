import { NextResponse } from "next/server";

export const revalidate = 300;

type GraphPost = {
  id: string;
  message?: string;
  created_time?: string;
  permalink_url?: string;
  full_picture?: string;
  attachments?: {
    data?: Array<{
      media?: { image?: { src?: string } };
      subattachments?: { data?: Array<{ media?: { image?: { src?: string } } }> };
    }>;
  };
};

export async function GET() {
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID || "888305024620633";

  if (!accessToken) {
    return NextResponse.json(
      { configured: false, posts: [] },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const fields =
    "id,message,created_time,permalink_url,full_picture,attachments{media,type,url,subattachments}";
  const url = new URL(`https://graph.facebook.com/v27.0/${encodeURIComponent(pageId)}/feed`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("limit", "6");
  url.searchParams.set("is_published", "true");
  url.searchParams.set("access_token", accessToken);

  try {
    const response = await fetch(url, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });
    const payload = await response.json();

    if (!response.ok || payload.error) {
      console.error("Facebook Graph API request failed", {
        status: response.status,
        code: payload.error?.code,
        subcode: payload.error?.error_subcode,
      });
      return NextResponse.json(
        { configured: true, posts: [], error: "facebook_unavailable" },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    const posts = ((payload.data || []) as GraphPost[]).map((post) => {
      const attachment = post.attachments?.data?.[0];
      const nestedImage = attachment?.subattachments?.data?.[0]?.media?.image?.src;
      const imageUrl =
        post.full_picture || attachment?.media?.image?.src || nestedImage || null;

      return {
        id: post.id,
        message: post.message || "",
        createdTime: post.created_time || null,
        permalink: post.permalink_url || `https://www.facebook.com/${post.id}`,
        imageUrl,
      };
    });

    return NextResponse.json(
      { configured: true, posts },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
    );
  } catch {
    return NextResponse.json(
      { configured: true, posts: [], error: "facebook_unavailable" },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
