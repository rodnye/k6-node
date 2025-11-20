/**
 * Represents a load testing stage with duration and target virtual users
 * In k6, this defines how many VUs to run for how long during ramp-up/down phases
 * 
 * @example
 * // Ramp-up from 0 to 100 users over 2 minutes
 * { duration: "2m", target: 100 }
 *
 * @example
 * // Stay at 100 users for 5 minutes
 * { duration: "5m", target: 100 }
 *
 * @example
 * // Ramp-down from 100 to 0 users over 1 minute
 * { duration: "1m", target: 0 }
 */
export interface Stage {
  duration: string;
  target: number;
};

/**
 * Defines performance thresholds for k6 metrics
 * In k6, thresholds are pass/fail criteria for test metrics like response times or error rates
 * 
 * @example
 * // 95% of requests must complete under 500ms, 99% under 1s
 * {
 *   "http_req_duration": ["p(95)<500", "p(99)<1000"]
 * }
 *
 * @example
 * // Error rate must be below 1%, no failed requests
 * {
 *   "http_req_failed": ["rate<0.01"],
 *   "errors": ["count==0"]
 * }
 *
 * @example
 * // Multiple thresholds for different metrics
 * {
 *   "http_req_duration": ["p(95)<500", "p(99)<1000"],
 *   "http_req_failed": ["rate<0.01"],
 *   "checks": ["rate>0.99"]
 * }
 */
export interface Threshold {
  [metric: string]: string[];
};

/**
 * Global options for k6 test configuration
 * These options control test execution parameters like VUs, duration, and thresholds
 * @example
 * // Smoke test with fixed VUs
 * {
 *   vus: 10,
 *   duration: "1m",
 *   thresholds: {
 *     "http_req_duration": ["p(95)<1000"],
 *     "http_req_failed": ["rate<0.01"]
 *   }
 * }
 *
 * @example
 * // Load test with ramp-up pattern
 * {
 *   stages: [
 *     { duration: "2m", target: 100 },    // Ramp-up to 100 users
 *     { duration: "5m", target: 100 },    // Stay at 100 users
 *     { duration: "1m", target: 0 }       // Ramp-down to 0
 *   ],
 *   thresholds: {
 *     "http_req_duration": ["p(95)<500", "p(99)<1000"],
 *     "http_req_failed": ["rate<0.05"]
 *   }
 * }
 *
 * @example
 * // Iteration-based test
 * {
 *   vus: 5,
 *   iterations: 1000,
 *   thresholds: {
 *     "checks": ["rate>0.99"],
 *     "http_req_duration": ["p(95)<200"]
 *   }
 * }
 */
export interface Options {
  stages?: Stage[];
  thresholds?: Threshold;
  vus?: number;
  duration?: string;
  iterations?: number;
  [key: string]: any;
};
