import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';

async function getUser(email: string): Promise<User | undefined> {
    try {
        const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
        return user.rows[0];
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}


/**
 * NextAuth is a wrapper around the Next.js API routes.
 * It provides a session object that contains the user's session, and a request object that contains the incoming request.
 * The session object is used to check if the user is authenticated, and the request object is used to redirect the user to the dashboard if they are already authenticated.
 * 
 * To set it up with the Credentials provider, you need to pass the authorize function to the Credentials provider.
 * This function is called when the user submits the login form.
 * It receives the credentials from the form and returns the user object if the credentials are valid, or null if they are not.
 */
export const { auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);
                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user) return null;
                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) return user;

                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});