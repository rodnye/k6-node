import { Request } from '../types/request-types';

/**
 * Create an HTTP request configuration for k6
 * k6 will execute this request and collect performance metrics
 *
 * @param method - HTTP method (GET, POST, etc.)
 * @param url - Target URL for the request
 * @param options - Additional request options like body, params, headers
 * @returns Request configuration object
 */
export function httpK6Request(
  method: Request['method'],
  url: string,
  options: {
    body?: any;
    params?: any;
    headers?: Record<string, string>;
  } = {}
): Request {
  return {
    method,
    url,
    ...options,
  };
}

/**
 * Create a GET request for k6
 *
 * @param url - Target URL
 * @param options - Request options excluding method and URL
 * @returns GET request configuration
 */
export function k6GET(
  url: string,
  options?: Omit<Request, 'method' | 'url'>
): Request {
  return httpK6Request('GET', url, options);
}

/**
 * Create a POST request for k6
 *
 * @param url - Target URL
 * @param body - Request body data
 * @param options - Request options excluding method, URL and body
 * @returns POST request configuration
 */
export function k6POST(
  url: string,
  body?: any,
  options?: Omit<Request, 'method' | 'url' | 'body'>
): Request {
  return httpK6Request('POST', url, { ...options, body });
}

/**
 * Create a PUT request for k6
 *
 * @param url - Target URL
 * @param body - Request body data
 * @param options - Request options excluding method, URL and body
 * @returns PUT request configuration
 */
export function k6PUT(
  url: string,
  body?: any,
  options?: Omit<Request, 'method' | 'url' | 'body'>
): Request {
  return httpK6Request('PUT', url, { ...options, body });
}

/**
 * Create a DELETE request for k6
 *
 * @param url - Target URL
 * @param options - Request options excluding method and URL
 * @returns DELETE request configuration
 */
export function k6DELETE(
  url: string,
  options?: Omit<Request, 'method' | 'url'>
): Request {
  return httpK6Request('DELETE', url, options);
}
