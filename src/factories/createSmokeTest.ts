import { K6TestBuilder } from '../builders/k6-builder';
import { Step } from '../types/request-types';

/**
 * Create a smoke test for k6 (quick verification)  
 * Smoke tests in k6 verify basic functionality with minimal load
 * 
 * @param config - Configuration with basic test parameters
 * @returns Configured K6TestBuilder instance
 */
export function createK6SmokeTest(config: {
  steps: Step[];
  vus?: number;
  duration?: string;
  imports?: string[];
}): K6TestBuilder {
  const builder = new K6TestBuilder();

  if (config.imports) {
    builder.addImports(...config.imports);
  }

  builder.setOptions({
    vus: config.vus || 1,
    duration: config.duration || '1m',
  });

  builder.createScenario('smoke_test', config.steps);

  return builder;
}
