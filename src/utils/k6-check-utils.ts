import { Check } from '../types/request-types';

/**
 * Create a status code check for k6 responses  
 * k6 will validate that responses match the expected HTTP status
 * 
 * @param expectedStatus - Expected HTTP status code
 * @returns Check configuration for status validation
 */
export function statusCheck(expectedStatus: number): Check {
  return {
    name: `status is ${expectedStatus}`,
    condition: `(r) => r.status === ${expectedStatus}`,
  };
}

/**
 * Create a response time check for k6
 * k6 will validate that response times are within the specified limit
 * 
 * @param maxTime - Maximum allowed response time in milliseconds
 * @returns Check configuration for response time validation
 */
export function responseTimeCheck(maxTime: number): Check {
  return {
    name: `response time < ${maxTime}ms`,
    condition: `(r) => r.timings.duration < ${maxTime}`,
  };
}