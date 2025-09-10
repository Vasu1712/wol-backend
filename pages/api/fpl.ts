import type { NextApiRequest, NextApiResponse } from 'next';

// Define a type for the expected error response for better type safety
type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown | ErrorResponse>
) {
  // Base URL for the Fantasy Premier League API
  const baseUrl = "https://fantasy.premierleague.com/api/leagues-classic/1690575/standings/?page_new_entries=1&phase=1&page_standings=";
  
  // URLs for both pages
  const url1 = `${baseUrl}1`;
  const url2 = `${baseUrl}2`;

  try {
    // Fetch data from both URLs concurrently
    const [response1, response2] = await Promise.all([
      fetch(url1),
      fetch(url2)
    ]);

    // Check if both requests were successful
    if (!response1.ok) {
      return res.status(response1.status).json({
        error: `Failed to fetch page 1: ${response1.statusText}`
      });
    }
    if (!response2.ok) {
      return res.status(response2.status).json({
        error: `Failed to fetch page 2: ${response2.statusText}`
      });
    }

    // Parse the JSON data from both responses
    const data1 = await response1.json();
    const data2 = await response2.json();

    // Combine the 'results' arrays from the 'standings' object of both pages
    const combinedResults = [
      ...data1.standings.results,
      ...data2.standings.results
    ];

    // Create a new response object based on the structure of the first page's data,
    // but with the combined results.
    const combinedData = {
      ...data1,
      standings: {
        ...data1.standings,
        results: combinedResults,
        // You might want to update pagination info if needed, for example:
        has_next: false // Or determine this based on the second response
      }
    };
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Send the combined data as the response
    res.status(200).json(combinedData);

  } catch (error) {
    // Handle any other errors
    console.error('Error fetching combined fantasy data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
