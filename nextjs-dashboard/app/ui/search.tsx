'use client'; // Allows use of event listeners and hooks.

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useDebouncedCallback } from 'use-debounce';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams(); // Get params passed via URL.
  const pathname = usePathname(); // Get the current path.
  const { replace } = useRouter(); // Use the replace method to update URL with client-side navigation (without page refresh).

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1'); // Reset page to 1 when user makes a new search.
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`); // Update the URL with serach params. e.g /dashboard/invoices?query=mySearchParam
  }, 300); // Debounce 300 ms to prevent too many requests.

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get('query')?.toString()} // Using defaultValue over value to let input itself manage its state. use Value to make it a controlled by React.
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
