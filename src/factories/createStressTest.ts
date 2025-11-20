import { K6TestBuilder } from '../builders/k6-builder';
import { Step } from '../types/request-types';
import { Stage, Threshold } from '../types/test-types';
import { createK6LoadTest } from './createLoadTest';

/**
 * Create a stress test for k6  
 * Stress tests in k6 push systems beyond normal operational capacity
 * 
 * @param config - Configuration with stress test parameters
 * @returns Configured K6TestBuilder instance
 */
export function createK6StressTest(config: {
  stages: Stage[];
  steps: Step[];
  thresholds?: Threshold;
  imports?: string[];
}): K6TestBuilder {
  return createK6LoadTest(config);
}
