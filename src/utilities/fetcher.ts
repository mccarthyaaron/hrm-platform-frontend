import { API_URL } from './globals';

interface ErrorBody {
  message: string;
  [key: string]: unknown;
}

export class HttpError extends Error {
  status: number;
  statusText: string;
  message: string;
  description: string;
  errorBody: ErrorBody;
  constructor(status: number, statusText: string, errorBody: ErrorBody) {
    super(statusText);
    this.status = status;
    this.statusText = statusText;
    this.message = errorBody.message;
    this.description = `Status code: ${this.status} - ${this.statusText}. ${this.message}`;
    this.errorBody = errorBody;
  }
}

type FetcherOptions = Omit<RequestInit, 'body'> & {
  body?: string | Record<string, unknown>; //Body passed to fetcher is an object literal or alread stringy-fied
  query?: Record<string, string | number | boolean>;
};

export async function fetcher<T>(path: string, options: FetcherOptions = {}): Promise<T> {
  const baseUrl = API_URL;

  // Build full URL with optional query params
  const url = new URL(path, baseUrl);
  if (options.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  const body = options.body;

  const hasBody = body !== undefined && body !== null && !(typeof body === 'string' && body.length === 0);

  const headers = new Headers({ Accept: 'application/json' });
  if (options.headers) new Headers(options.headers).forEach((v, k) => headers.set(k, v));

  if (hasBody) headers.set('Content-Type', 'application/json');

  const res = await fetch(url.toString(), {
    method: options.method || 'GET',
    headers: headers,
    body: body && typeof body !== 'string' ? JSON.stringify(body) : body,
    signal: options.signal,
  });

  const raw = await res.text();

  if (!res.ok) {
    let errorBody: ErrorBody;
    try {
      const errorData = JSON.parse(raw);
      if (isPlainObject(errorData)) {
        errorBody = {
          ...errorData,
          message: errorData.message || 'Something went wrong',
        };
      } else {
        errorBody = { message: raw };
      }
    } catch {
      errorBody = { message: raw };
    }
    throw new HttpError(res.status, res.statusText, errorBody);
  }

  // Handle empty responses
  if (res.status === 204) return undefined as T;

  const data = JSON.parse(raw);
  return data as T;
}

function isPlainObject(value: unknown) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
