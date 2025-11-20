import { K6TestBuilder } from '../builders/k6-builder';
import { Step } from '../types/request-types';
import { Stage } from '../types/test-types';

/**
 * Create a spike test for k6  
 * Spike tests in k6 simulate sudden bursts of traffic to test resilience
 * 
 * @param config - Configuration with spike test parameters
 * @returns Configured K6TestBuilder instance
 */
export function createK6SpikeTest(config: {
  steps: Step[];
  stages: Stage[];
  imports?: string[];
}): K6TestBuilder {
  const builder = new K6TestBuilder();

  if (config.imports) {
    builder.addImports(...config.imports);
  }

  builder.setOptions({
    stages: config.stages,
  });

  builder.createScenario('spike_test', config.steps);

  return builder;
}
