type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

export default async function sendRequest<T>(
    method: Method, 
    url: string, 
    body?: string | object,
    headers?: HeadersInit
): Promise<T | null> {
    try {
        const result = await fetch(url, {
            method,
            ...(body ? { body: JSON.stringify(body) } : {}),
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        });

        if (!result.ok) throw new Error(`(${result.status}) ${result.status}`);

        const data = await result.json();

        return data as T;
    } catch (error) {
        if (error instanceof Error) {
            console.log(`ServerError::[${error.name}] ${error.message}`);
        }
        return null;
    }
}