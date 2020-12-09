/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import http from 'k6/http'
import { check, group, sleep, fail } from 'k6'
import { Counter, Rate } from 'k6/metrics'

export const options = {
  scenarios: {
    scenario1: {
      executor: 'ramping-arrival-rate',
      startRate: '20',
      //timeUnit: '1s',
      preAllocatedVUS: 100,
      maxVUs: 500,
      gracefulStop: '110s',
      stages: [
        { target: 1, duration: '30s' },
        // { target: 20, duration: '10s' },
        // { target: 0, duration: '10s' },
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
const name = `${randomString(10)}`
const email = `${randomString(10)}@ucla.edu`

export default function () {
  // create user
  const body = JSON.stringify({ email, name })
  let createUserRes = http.post(
    `${BASE_URL}/auth/createUser`,
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
  sleep(1)

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
  //http.get(`${BASE_URL}/app/LobbyWait/lobby?lobbyId=${lobby_id}`)
  sleep(1)
  //{"operationName":"StartGame","variables":{"lobbyId":141},"query":"mutation StartGame($lobbyId: Int!) {\n  startGame(lobbyId: $lobbyId)\n}\n"}

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

  // navigate to game page
  //http.get(`${BASE_URL}/app/board/game?lobbyId=${lobby_id}`)
  sleep(1);

  // click move
  let makeMoveRes = http.post(
    `${BASE_URL}/graphql`,
    `{"operationName":"MakeMove","variables":{"input":{"playerId":${id},"lobbyId":${lobby_id},"time":6828,"moveType":"DeselectTile","tiles":[{"letter":"E","pointValue":1,"tileType":"Normal","location":0}],"pointValue":0}},"query":"mutation MakeMove($input: MoveInput!) {makeMove(input: $input)}"}`,
    {
      headers: {
      'Content-Type': 'application/json',
     },
    }
  );
  check(makeMoveRes, { 'move made': (r) => r.status == 200 });

  sleep(2);
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
