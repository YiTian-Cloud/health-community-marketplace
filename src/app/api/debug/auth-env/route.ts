export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    AUTH_URL: process.env.AUTH_URL ?? null,
    has_AUTH_SECRET: !!process.env.AUTH_SECRET,
    has_GITHUB_ID: !!process.env.GITHUB_ID,
    has_GITHUB_SECRET: !!process.env.GITHUB_SECRET,
  });
}
