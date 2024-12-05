import axios from 'axios';

export async function POST(req) {
  // Add CORS headers
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request (OPTIONS method)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // Parse the request body
  let body;
  try {
    body = await req.json();
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON in request body' }),
      {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      }
    );
  }

  const query = body.query;

  // Validate the "query" parameter
  if (!query) {
    return new Response(
      JSON.stringify({
        error: 'The "query" field is required in the request body',
      }),
      {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      }
    );
  }

  // Fetch data from GraphDB
  try {
    const response = await axios.get(
      `${
        process.env.NEXT_PUBLIC_DB_HOST
      }/repositories/kgbunshin?query=${encodeURIComponent(query)}`,
      {
        params: {
          infer: false,
          sameAs: true,
        },
        headers: {
          Accept: 'application/json',
        },
      }
    );

    return new Response(JSON.stringify(response.data), {
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching data from GraphDB:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch data from GraphDB' }),
      {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      }
    );
  }
}
