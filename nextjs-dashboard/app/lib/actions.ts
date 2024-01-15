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

    try {
        await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Invoice.',
        };
    };
    revalidatePath('/dashboard/invoices'); // Revalidate the client-side route cache to update UI with new data.

    /**
     * Note how redirect is being called outside of the try/catch block.
     * This is because redirect works by throwing an error, which would be caught by the catch block.
     * To avoid this, you can call redirect after try/catch. redirect would only be reachable if try is successful.
     */
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

    try { // Pass the variables to the SQL query.
        await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Invoice.',
        };
    };
    revalidatePath('/dashboard/invoices'); // clear the client cache and make a new server request.
    redirect('/dashboard/invoices'); // redirect the user to the invoice's page.
};

export async function deleteInvoice(id: string) {
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices'); // revalidate clientside route cache, since we deleted an invoice.
        // Since this action is being called in the /dashboard/invoices path, you don't need to call redirect. Calling revalidatePath will trigger a new server request and re-render the table.
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Invoice.',
        };
    };
}