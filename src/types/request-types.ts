/**
 * Represents an HTTP request to be executed in k6  
 * k6 will execute this request and collect metrics like response time and status
 */
export interface Request {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  body?: any;
  params?: any;
  headers?: Record<string, string>;
};

/**
 * Defines a validation criteria for k6 HTTP response validation.
 * 
 * k6 runtime automatically executes these checks during load testing and
 * provides aggregated success/failure metrics in the test summary report.
 * 
 * @example
 * const check = {
 *   name: "HTTP status is 200",
 *   condition: "(response) => response.status === 200"
 * };
 */
export interface Check {
  
  name: string;

  /**
   * JavaScript function that evaluates to boolean.  
   * The function should return `true` for success, `false` for failure.  
   * Example: `"(response) => response.status === 200"`
   */
  condition: string | ((r: Response) => boolean);
};

/**
 * Represents a single step in a k6 test scenario  
 * Each step can include a request, validation checks, and optional sleep period
 */
export interface Step {
  name?: string;
  request: Request;
  checks?: Check[];
  sleep?: string | number;
};
