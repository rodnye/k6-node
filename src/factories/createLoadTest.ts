import { K6TestBuilder } from '../builders/k6-builder';
import { Step } from '../types/request-types';
import { Stage, Threshold } from '../types/test-types';

/**
 * Create a simple load test with stages for k6  
 * In k6, load tests typically use ramping VUs to simulate realistic traffic patterns
 * 
 * @param config - Configuration object with stages, steps, and thresholds
 * @returns Configured K6TestBuilder instance
 */
export function createK6LoadTest(config: {
  stages: Stage[];
  steps: Step[];
  thresholds?: Threshold;
  imports?: string[];
}): K6TestBuilder {
  const builder = new K6TestBuilder();

  if (config.imports) {
    builder.addImports(...config.imports);
  }

  builder.setOptions({
    stages: config.stages,
    thresholds: config.thresholds,
  });

  builder.createScenario('load_test', config.steps);

  return builder;
}
