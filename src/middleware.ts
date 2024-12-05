import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const acceptHeader = request.headers.get("accept");
  const resource = request.nextUrl.pathname.replace("/data/", "");

  if (acceptHeader?.includes("text/turtle")) {
    return NextResponse.redirect(new URL(`/api/rdf/${resource}`, request.url));
  }

  if (acceptHeader?.includes("text/html")) {
    return NextResponse.redirect(new URL(`/page/${resource}`, request.url));
  }

  return NextResponse.json({
    message: "Only 'text/turtle' and 'text/html' are supported",
    status: 400,
  });
}

export const config = {
  matcher: ["/data/:resource([\\w-_]+)"], // https://github.com/vercel/next.js/issues/53840
};
