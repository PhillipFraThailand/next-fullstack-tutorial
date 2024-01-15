'use server'; // Mark that all exported functions here are server side functions. ( Can however be imported on the client side )
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

    revalidatePath('/dashboard/invoices'); // Revalidate the client-side route cache to update UI with new data.
    redirect('/dashboard/invoices'); // Redirect user back to the invoices page.

};

// This is the schema for the update form. We omit the id and date fields because we don't want them to be updated.
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
    // Extract the form data and validate it with zod.
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    // Converting the amount to cents, as we did in the createInvoice function.
    const amountInCents = amount * 100;

    // Pass the variables to the SQL query.
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;

    revalidatePath('/dashboard/invoices'); // clear the client cache and make a new server request.
    redirect('/dashboard/invoices'); // redirect the user to the invoice's page.
};