import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/invoices/table';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { fetchInvoicesPages } from '@/app/lib/data';

/**
 * When implementing search the keys are to update the URL with search params and send those params to the server.
 * 1. Get the search params via the URL query string. Done with usePathname on client components.
 * 2. Update the URL with the search params. Done by taking input, and using replace from the useRouter hook, to instantly update the URL.
 * 3. Send the search params to the server. Done by passing the search params to the server component.
 * 4. On the server the component cannot use hooks, so it uses props passed from the page.
 */

export default async function Invoices({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchInvoicesPages(query); //  if there are 12 invoices that match the search query, and each page displays 6 invoices, then the total number of pages would be 2.

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        {/* <Search> uses useSearchParams because it's a client component so, we can access the params from the client*/}
        <Search placeholder="Search invoices..." />
        <CreateInvoice />
      </div>
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        {/* <Table> uses searchParams prop because it's a server component so, it fetches its own data so we can pass searchParams prop from the page to the component */}
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
