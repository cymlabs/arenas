import { NextResponse } from 'next/server';

export async function GET() {
  const rules = [`User-agent: *`, `Allow: /`, '', `Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://arenas.local'}/sitemap.xml`];
  return new NextResponse(rules.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    }
  });
}
