const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || '';

export async function querySubgraph<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
  if (!SUBGRAPH_URL) {
    throw new Error('NEXT_PUBLIC_SUBGRAPH_URL is not configured');
  }

  console.log('[Subgraph Query]', { query, variables, url: SUBGRAPH_URL });

  const response = await fetch(SUBGRAPH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    console.error('[Subgraph Error] Response not OK:', response.statusText);
    throw new Error(`Subgraph query failed: ${response.statusText}`);
  }

  const result = await response.json();
  console.log('[Subgraph Response]', result);

  if (result.errors) {
    console.error('[Subgraph Error] GraphQL errors:', result.errors);
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  return result.data;
}
