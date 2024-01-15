import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: { // callback is used to verify if the request is authorized to access a page via Next.js Middleware. It is called before a request is completed.
        authorized({ auth, request: { nextUrl } }) { // The auth property contains the user's session, and the request property contains the incoming request.
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
    },
    providers: [Credentials({})],
} satisfies NextAuthConfig;
