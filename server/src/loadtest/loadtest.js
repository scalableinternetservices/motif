import { serializeFetchParameter } from '@apollo/client'
import http from 'k6/http'
import { check, group, sleep, fail } from 'k6'
import { Counter, Rate } from 'k6/metrics'

export const options = {
  scenarios: {
    scenario1: {
      executor: 'ramping-arrival-rate',
      startRate: '50',
      timeUnit: '1s',
      preAllocatedVUS: 50,
      maxVUs: 100,
      stages: [
        { target: 20, duration: '10s' },
        { target: 20, duration: '10s' },
        { target: 0, duration: '10s'},
      ],
    },
  },
}

export default function () {
  sleep(1)
}
