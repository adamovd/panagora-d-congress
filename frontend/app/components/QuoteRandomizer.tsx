"use client";

import {useState, useEffect} from 'react';

type Quote = {
	_id: string;
	text: string;
	category: string;
};

interface QuoteRandomizerProps {
	quotes: Quote[];
}

export default function QuoteRandomizer({ quotes }: QuoteRandomizerProps) {
	// Defensive: ensure quotes is always an array
	const safeQuotes = Array.isArray(quotes) ? quotes : [];
	if (!Array.isArray(quotes)) {
		console.warn('QuoteRandomizer: quotes prop is not an array:', quotes);
	}
	const [quote, setQuote] = useState<Quote | null>(null);

	return (
		<div className="flex flex-col items-center justify-center min-h-[200px] w-full">
			<div className="w-full max-w-xl mt-8">
				<h3 className="text-lg font-bold mb-2">All Quotes</h3>
				<ul className="bg-gray-50 rounded p-4 divide-y divide-gray-200">
					{safeQuotes.length === 0 && <li className="text-gray-400">No quotes found.</li>}
					{safeQuotes.map(q => (
						<li key={q._id} className="py-2">
							<span className="font-medium">{q.text}</span>
							<span className="ml-2 text-xs text-gray-500">[{q.category}]</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
