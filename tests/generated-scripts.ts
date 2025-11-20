import { createK6StressTest, K6TestBuilder } from '../dist';

const generateScript1 = new K6TestBuilder()
  .addScenario({
    name: 'probando1',
    steps: [
      {
        name: '1',
        request: {
          method: 'POST',
          url: 'https://localhost:6000',
          body: { wii: 9 },
          headers: { ff: 'ff' },
        },
        checks: [
          {
            name: 'not minor of 5',
            condition: (r) => r.status === 90,
          },
        ],
        sleep: 90,
      },
    ],
  })
  .generateScript();

const generateScript2 = createK6StressTest({
  stages: [{ duration: '2min', target: 100 }],
  steps: [{ request: { method: 'POST', url: 'localhost:3000' } }],
}).generateScript();
