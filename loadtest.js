/* eslint-disable prettier/prettier */
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
      maxVUs: 500,
      stages: [
        { target: 100, duration: '30s' },
        { target: 200, duration: '30s' },
        { target: 0, duration: '30s' },
      ],
    },
  },
}

function randomString(length) {
  const charset = 'abcdefghijklmnopqrstuvwxyz';
  let res = '';
  while (length--) res += charset[(Math.random() * charset.length) | 0];
  return res;
}

const BASE_URL = 'http://localhost:3000'
const userName = `${randomString(10)}`
const email = `${randomString(10)}@ucla.edu`

export default function () {
  // route to user login
  http.get(`${BASE_URL}/app/UserLogin`)
  sleep(Math.random() * 3)

  // create user
  const body = JSON.stringify({ userName })
  let createUserRes = http.post(
    `${BASE_URL}/auth/createUser_`,
    `${body}`,
    {
      headers: {
        'Content-Type': 'application/json',
     },
    }
  );
  check(createUserRes, { 'created user': (r) => r.status === 200 });

  // get id
  let fetchUserRes = http.post(
    `${BASE_URL}/graphql`,
    '{"operationName":"FetchUserContext","variables":{},"query":"query FetchUserContext{self{id}}"}',
    {
      headers: {
      'Content-Type': 'application/json',
     },
    }
  );
  const id = fetchUserRes.json('data').self.id

  // route to lobby search
  http.get(`${BASE_URL}/app/LobbySearch`)
  sleep(Math.random() * 3)

  // create lobby
  let createLobbyRes = http.post(
    `${BASE_URL}/graphql`,
    `{"operationName":"CreateLobby","variables":{"userId":${id},"maxUsers":4,"maxTime":5,"state":true},"query":"mutation CreateLobby($userId: Int!, $maxUsers: Int!, $maxTime: Int!, $state: Boolean!) { createLobby(userId: $userId, maxUsers: $maxUsers, maxTime: $maxTime, state: $state)}"}`,
    {
      headers: {
      'Content-Type': 'application/json',
     },
    }
  );
  const lobby_id = createLobbyRes.json('data').createLobby
  check(createLobbyRes, { 'created lobby': (r) => r.status == 200 });

  // route to lobby page
  http.get(`${BASE_URL}/app/Lobby`)
  sleep(Math.random() * 3)

  // start game
  let startGameRes = http.post(
    `${BASE_URL}/graphql`,
    `{"operationName":"StartGame","variables":{"lobbyId":${lobby_id}},"query":"mutation StartGame($lobbyId: Int!) {  startGame(lobbyId: $lobbyId)}"}`,
    {
      headers: {
      'Content-Type': 'application/json',
     },
    }
  );
  check(startGameRes, { 'started game': (r) => r.status == 200 });

  // logout
  let logoutRes = http.post(
    `${BASE_URL}/auth/logout`,
    {
      headers: {
        'Content-Type': 'application/json',
     },
    }
  );
  check(logoutRes, { 'logged out': (r) => r.status == 200 });
}

// const count200 = new Counter('status_code_2xx')
// const count300 = new Counter('status_code_3xx')
// const count400 = new Counter('status_code_4xx')
// const count500 = new Counter('status_code_5xx')

// const rate200 = new Rate('rate_status_code_2xx')
// const rate300 = new Rate('rate_status_code_3xx')
// const rate400 = new Rate('rate_status_code_4xx')
// const rate500 = new Rate('rate_status_code_5xx')

// function recordRates(res) {
//   if (res.status >= 200 && res.status < 300) {
//     count200.add(1)
//     rate200.add(1)
//   } else if (res.status >= 300 && res.status < 400) {
//     console.log(res.body)
//     count300.add(1)
//     rate300.add(1)
//   } else if (res.status >= 400 && res.status < 500) {
//     count400.add(1)
//     rate400.add(1)
//   } else if (res.status >= 500 && res.status < 600) {
//     count500.add(1)
//     rate500.add(1)
//   }
// }
