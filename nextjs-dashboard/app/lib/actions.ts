'use server'; // Mark that all exported functions here are server side functions. ( Can however be imported on the client side )
import { z } from 'zod';
import { sql } from '@vercel/postgres';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(), // Coerce casts the value to a number
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });


export async function createInvoice(formData: FormData) {
    // For forms with lots of fields, conside const rawFormData = Object.fromEntries(formData.entries());
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });


    const amountInCents = amount * 100; // Its good practice to store monetary values in cents in databases to eliminate JavaScript floating-point errors and ensure greater accuracy.
    const date = new Date().toISOString().split('T')[0]; // The 'T' separates the date (2022-03-14) from the time (10:30:00Z) in out ISOString 2022-03-14T10:30:00Z. So we will get '2022-03-14'.

    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status})
    `;
};