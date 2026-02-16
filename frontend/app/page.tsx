import QuoteRandomizer from './components/QuoteRandomizer'

import { allQuotesQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'

export default async function Page() {

  const result = await sanityFetch({ query: allQuotesQuery });
  // Ensure quotes is an array for QuoteRandomizer
  const quotes = Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : [];

  return (
    <>
      <div className="relative">
        <div className="flex flex-col items-center mt-10">
          <QuoteRandomizer quotes={quotes} />
        </div>
      </div>
  
    </>
  );
}
