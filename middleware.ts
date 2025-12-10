import { auth } from "@/lib/auth"

export default auth((req) => {
  const isAuth = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith('/login')
  const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth')

  if (isApiAuthRoute) {
    return
  }

  if (isAuthPage) {
    if (isAuth) {
      return Response.redirect(new URL('/dashboard', req.nextUrl))
    }
    return
  }

  if (!isAuth) {
    let from = req.nextUrl.pathname
    if (req.nextUrl.search) {
      from += req.nextUrl.search
    }

    return Response.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, req.nextUrl)
    )
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

// Force middleware to use Node.js runtime instead of Edge runtime
export const runtime = "nodejs"