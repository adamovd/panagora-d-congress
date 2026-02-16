import QuoteRandomizer from './components/QuoteRandomizer'

import { allQuotesQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'

export default async function Page() {
  const quotes = await sanityFetch({ query: allQuotesQuery });

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
