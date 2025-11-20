<p align="center">
  <img src="https://raw.githubusercontent.com/rodnye/k6-node/refs/heads/main/assets/k6-node.svg" alt="k6-node logo" width="210" height="210" />
</p>

<h3 align="center">K6 for Node.js</h3>

<p align="center">CLI tool and programmatic builder that enables k6 installation and test creation via npm packages</p>

<p align="center">
  <a href="https://k6.io/">
    <img src="https://img.shields.io/badge/k6-1.4.0-blue?logo=k6&logoColor=7D64FF" alt="k6 version">
  </a>
  <a href="https://www.npmjs.com/package/k6-node">
    <img src="https://img.shields.io/npm/v/k6-node" alt="npm">
  </a>
  <a href="https://www.npmjs.com/package/k6-node">
    <img src="https://img.shields.io/npm/l/k6-node" alt="License">
  </a>
  <a href="https://github.com/rodnye/k6-node/actions/workflows/publish.yml">
    <img src="https://github.com/rodnye/k6-node/actions/workflows/publish.yml/badge.svg" alt="npm publish">
  </a>
</p>

## Overview

A comprehensive Node.js solution that bridges the gap in the [k6 ecosystem](https://github.com/grafana/k6): **k6 currently doesn't support installation via npm packages**. This package provides both a CLI tool and a powerful programmatic builder to define k6 as a dependency in your project and automatically handles the binary installation process.

## Features

- **🔧 Automatic Binary Management**: Downloads and installs the appropriate k6 binary for Windows, Linux, and macOS
- **🧩 Programmatic Test Builder**: Create k6 tests using a fluent, type-safe TypeScript API
- **📦 NPM Integration**: Use k6 as a proper npm dependency in your projects
- **⚙️ Custom Binary Support**: Configure custom k6 binary paths via `.k6path` file
- **🎯 Test Factories**: Pre-configured factories for common test types (load, smoke, spike, stress)
- **📊 Type Safety**: Full TypeScript support with comprehensive type definitions

## Related Documentation

- [k6 Official Documentation](https://k6.io/docs/)
- [k6 JavaScript API](https://k6.io/docs/javascript-api/)
- [k6 Installation Guide](https://k6.io/docs/getting-started/installation/)
- [k6 Testing Guides](https://k6.io/docs/testing-guides/)

## Installation

```bash
npm install k6-node --save-dev
```

## Usage

### CLI Usage

Once installed, you can run k6 commands directly through the package:

```bash
npx k6-node run script.js
```

The tool will:

1. Check for a custom k6 binary path in `.k6path` file
2. Use an already installed binary if available
3. Automatically download and install k6 binary if not found
4. Execute your k6 command seamlessly

### Programmatic Builder Usage

Create sophisticated k6 tests programmatically using the builder pattern:

```typescript
import { K6TestBuilder, k6GET, statusCheck } from 'k6-node';

const test = new K6TestBuilder()
  .addImports("import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js'")
  .setOptions({
    stages: [
      { duration: '2m', target: 100 },    // Ramp-up to 100 users
      { duration: '5m', target: 100 },    // Stay at 100 users
      { duration: '1m', target: 0 }       // Ramp-down to 0
    ],
    thresholds: {
      'http_req_duration': ['p(95)<500', 'p(99)<1000'],
      'http_req_failed': ['rate<0.01']
    }
  })
  .createScenario('main_scenario', [
    {
      name: 'Get homepage',
      request: k6GET('https://test-api.k6.io/public/crocodiles/'),
      checks: [statusCheck(200)],
      sleep: '1s'
    }
  ])
  .setRawSetupCode(`
    console.log('Test setup completed');
    return { timestamp: new Date().toISOString() };
  `)
  .setRawTeardownCode(`
    console.log('Test teardown completed');
    console.log('Setup data:', JSON.stringify(data));
  `);

// Run the test
await test.run({
  output: 'json=results.json',
  verbose: true
});

// Or save the script for later use
test.saveScript('load-test.js');
```

### Test Factories

Use pre-configured factories for common test patterns:

```typescript
import { createK6LoadTest, createK6SmokeTest, k6GET, statusCheck } from 'k6-node';

// Load Test
const loadTest = createK6LoadTest({
  stages: [
    { duration: '5m', target: 100 },
    { duration: '10m', target: 100 },
    { duration: '5m', target: 0 }
  ],
  steps: [
    {
      request: k6GET('https://api.example.com/users'),
      checks: [statusCheck(200)]
    }
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500']
  }
});

// Smoke Test
const smokeTest = createK6SmokeTest({
  steps: [
    {
      request: k6GET('https://api.example.com/health'),
      checks: [statusCheck(200)]
    }
  ],
  vus: 1,
  duration: '1m'
});
```

### Custom Binary Path

Create a `.k6path` file in your project root containing the path to your custom k6 binary:

```text
/path/to/your/custom/k6
```

## Project Integration

Add k6 as a development dependency in your `package.json`:

```json
{
  "devDependencies": {
    "k6-node": "^1.0.0"
  },
  "scripts": {
    "test:load": "k6-node run tests/load.js",
    "test:smoke": "k6-node run tests/smoke.js",
    "test:build": "node build-test.js"
  }
}
```

## Example: Complete Load Test

```typescript
// load-test.ts
import { createK6LoadTest, k6GET, k6POST, statusCheck, responseTimeCheck } from 'k6-node';

const test = createK6LoadTest({
  stages: [
    { duration: '2m', target: 50 },
    { duration: '3m', target: 100 },
    { duration: '2m', target: 50 },
    { duration: '1m', target: 0 }
  ],
  steps: [
    {
      name: 'Get users list',
      request: k6GET('https://api.example.com/users'),
      checks: [
        statusCheck(200),
        responseTimeCheck(1000)
      ],
      sleep: '1s'
    },
    {
      name: 'Create new user',
      request: k6POST('https://api.example.com/users', {
        name: 'Test User',
        email: 'test@example.com'
      }),
      checks: [
        statusCheck(201),
        responseTimeCheck(2000)
      ]
    }
  ],
  thresholds: {
    'http_req_duration': ['p(95)<800', 'p(99)<1500'],
    'http_req_failed': ['rate<0.05'],
    'checks': ['rate>0.95']
  },
  imports: [
    "import { Trend, Counter } from 'k6/metrics';"
  ]
});

// Run with detailed output
test.run({
  output: 'json=results.json',
  verbose: true,
  environment: {
    K6_WEB_DASHBOARD: 'true'
  }
});
```

## Architecture

The package consists of two main components:

1. **CLI Tool**: Handles k6 binary management and execution
2. **Programmatic Builder**: Provides a fluent API for creating k6 tests in TypeScript/JavaScript

## Future Development

This package will continue to evolve with additional test factories, enhanced reporting integration, and extended k6 feature support.

## License

MIT