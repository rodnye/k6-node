import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { getK6BinaryPath } from '../k6path';
import { Step } from '../types/request-types';
import { K6TestConfig, Scenario } from '../types/scenario-types';
import { Options } from '../types/test-types';

/**
 * Builder class for creating and executing k6 load tests  
 * This class generates k6 JavaScript code and executes it using the k6 binary
 */
export class K6TestBuilder {
  private config: K6TestConfig = {
    scenarios: [],
  };

  private imports: Set<string> = new Set([
    "import http from 'k6/http';",
    "import { check, sleep } from 'k6';",
  ]);

  /**
   * Add imports to the k6 test script  
   * In k6, imports bring in modules like http, websockets, or custom metrics
   * 
   * @param imports - Array of import statements for k6 modules
   * @returns This builder instance for method chaining
   */
  addImports(...imports: string[]): this {
    imports.forEach((imp) => this.imports.add(imp));
    return this;
  }

  /**
   * Set global options for the k6 test  
   * These options configure test-wide settings like VUs, duration, and thresholds
   * 
   * @param options - k6 options object defining test execution parameters
   * @returns This builder instance for method chaining
   */
  setOptions(options: Options): this {
    this.config.options = { ...this.config.options, ...options };
    return this;
  }

  /**
   * Add a scenario to the k6 test
   * Scenarios in k6 allow different execution patterns and workload models
   * 
   * @param scenario - Scenario configuration with steps and executor
   * @returns This builder instance for method chaining
   */
  addScenario(scenario: Scenario): this {
    this.config.scenarios!.push(scenario);
    return this;
  }

  /**
   * Create a simple scenario with steps for k6 execution
   * 
   * @param name - Unique name for the scenario
   * @param steps - Array of steps to execute in k6
   * @param executor - k6 executor type defining how VUs execute iterations
   * @returns This builder instance for method chaining
   */
  createScenario(name: string, steps: Step[], executor?: string): this {
    return this.addScenario({
      name,
      steps,
      executor: executor as any,
    });
  }

  /**
   * Set raw JavaScript code for k6 setup function  
   * In k6, setup runs once at test start and can return data to the main function
   * 
   * @param setupCode - JavaScript code string for k6 setup function
   * @returns This builder instance for method chaining
   */
  setRawSetupCode(setupCode: string): this {
    this.config.setup = setupCode;
    return this;
  }

  /**
   * Set raw JavaScript code for k6 teardown function  
   * In k6, teardown runs once at test end for cleanup operations
   * 
   * @param teardownCode - JavaScript code string for k6 teardown function
   * @returns This builder instance for method chaining
   */
  setRawTeardownCode(teardownCode: string): this {
    this.config.teardown = teardownCode;
    return this;
  }

  /**
   * Generate the complete k6 test script as JavaScript code  
   * This creates executable k6 code with imports, options, and scenario functions
   * 
   * @returns Complete k6 test script as a string
   */
  generateScript(): string {
    let script = Array.from(this.imports).join('\n') + '\n\n';

    if (this.config.options) {
      script += `export const options = ${JSON.stringify(
        this.config.options,
        null,
        2
      )};\n\n`;
    }

    if (this.config.setup) {
      script += `export function setup() {\n${this.config.setup}\n}\n\n`;
    }

    if (this.config.teardown) {
      script += `export function teardown(data) {\n${this.config.teardown}\n}\n\n`;
    }

    if (this.config.scenarios && this.config.scenarios.length > 0) {
      if (this.config.scenarios.length === 1) {
        // single scenario - use default function
        const scenario = this.config.scenarios[0];
        script += `export default function() {\n${this.generateScenarioCode(
          scenario
        )}\n}`;
      } else {
        //multiple scenarios
        script += `export const options = {\n`;
        this.config.scenarios.forEach((scenario, index) => {
          script += `  ${scenario.name}: {\n`;
          script += `    executor: '${scenario.executor || 'shared-iterations'}',\n`;
          // add other scenario-specific options
          Object.keys(scenario).forEach((key) => {
            if (!['name', 'steps', 'executor'].includes(key)) {
              script += `    ${key}: ${JSON.stringify(scenario[key])},\n`;
            }
          });
          script += `  }${index < this.config.scenarios!.length - 1 ? ',' : ''}\n`;
        });
        script += `};\n\n`;

        // fenerate scenario functions
        this.config.scenarios.forEach((scenario) => {
          script += `export function ${scenario.name}() {\n${this.generateScenarioCode(scenario)}\n}\n\n`;
        });
      }
    } else {
      // default empty function if no scenarios
      script += `export default function() {\n  throw new Error("No scenarios defined");\n}`;
    }

    return script;
  }

  /**
   * Generate k6 JavaScript code for a single scenario  
   * This creates the actual HTTP requests and checks that k6 will execute
   * 
   * @param scenario - Scenario configuration to generate code for
   * @returns JavaScript code string for the scenario
   */
  private generateScenarioCode(scenario: Scenario): string {
    let code = '';

    scenario.steps.forEach((step) => {
      if (step.name) {
        code += `  // ${step.name}\n`;
      }

      //
      const method = step.request.method.toLowerCase();
      const bodyParam = step.request.body
        ? `, ${JSON.stringify(step.request.body)}`
        : '';
      const paramsParam = step.request.params
        ? `, { ${Object.entries(step.request.params)
          .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
          .join(', ')} }`
        : '';

      code += `  let res = http.${method}('${step.request.url}'${bodyParam}${paramsParam});\n`;

      //
      if (step.checks && step.checks.length > 0) {
        const checksObject: Record<string, string> = {};
        step.checks.forEach((check) => {
          checksObject[`'${check.name}'`] = check.condition.toString();
        });
        code += `  check(res, ${JSON.stringify(checksObject).replace(
          /"/g,
          ''
        )});\n`;
      }

      //
      if (step.sleep) {
        code += `  sleep(${step.sleep});\n`;
      }

      code += '\n';
    });

    return code;
  }

  /**
   * Execute the k6 test using the k6 binary  
   * This method generates the script, runs it with k6, and handles cleanup
   * 
   * @param options - Execution options for k6 including output and environment
   * @returns Promise that resolves when k6 execution completes
   */
  async run(
    options: {
      output?: string;
      quiet?: boolean;
      verbose?: boolean;
      environment?: Record<string, string>;
    } = {}
  ): Promise<void> {
    const script = this.generateScript();
    const tempDir = os.tmpdir();
    const scriptPath = path.join(tempDir, `k6-test-${Date.now()}.js`);

    // 
    fs.writeFileSync(scriptPath, script);

    try {
      const bin = await getK6BinaryPath();
      const args = ['run', scriptPath];

      // 
      if (options.output) {
        args.push('--out', options.output);
      }

      //
      if (options.quiet) {
        args.push('--quiet');
      }
      if (options.verbose) {
        args.push('--verbose');
      }

      console.log(`Running k6 test: ${scriptPath}`);

      if (!options.quiet) {
        console.log('Generated script:');
        console.log('---');
        console.log(script);
        console.log('---');
      }

      return new Promise((resolve, reject) => {
        const env = {
          ...process.env,
          ...options.environment,
        };

        const childProcess = spawn(bin, args, {
          stdio: 'inherit',
          env,
        });

        childProcess.on('close', (code) => {
          // destroy temporary file
          try {
            fs.unlinkSync(scriptPath);
          } catch (e) {
            // cleanupp errors is not important
          }

          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`k6 exited with code ${code}`));
          }
        });

        childProcess.on('error', (error) => {
          try {
            fs.unlinkSync(scriptPath);
          } catch (e) {}

          reject(error);
        });
      });
    } catch (error) {
      try {
        fs.unlinkSync(scriptPath);
      } catch (e) {}
      throw error;
    }
  }

  /**
   * Save the generated k6 script to a file for later use
   * 
   * @param filePath - Path where to save the k6 script file
   */
  saveScript(filePath: string): void {
    const script = this.generateScript();
    fs.writeFileSync(filePath, script);
    console.log(`Script saved to: ${filePath}`);
  }
}
