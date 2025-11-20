import { Options } from './test-types';
import { Step } from './request-types';

/**
 * Defines a test scenario in k6  
 * Scenarios allow different execution patterns and workload models in k6
 */
export interface Scenario {
  name: string;
  steps: Step[];
  executor?: 'shared-iterations' |
  'per-vu-iterations' |
  'constant-vus' |
  'ramping-vus' |
  'constant-arrival-rate' |
  'ramping-arrival-rate';
  
  [key: string]: any;
};

/**
 * Complete configuration for a k6 test  
 * Includes options, scenarios, and optional setup/teardown functions
 */
export interface K6TestConfig {
  options?: Options;
  scenarios?: Scenario[];
  setup?: string;
  teardown?: string;
};
