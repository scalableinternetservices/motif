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
        { target: 100, duration: '15s' },
        { target: 200, duration: '15s' },
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
const name = `${randomString(10)}`
const email = `${randomString(10)}@ucla.edu`

export default function () {
  let id, lobby_id;
  group('login', function() {
    // route to user login
    let loginRes = http.get(`${BASE_URL}/app/UserLogin`)
    check(loginRes, { 'status is 200': (r) => r.status == 200})

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
    )
    check(createUserRes, { 'created user': (r) => r.status === 200 })

    // get id
    let fetchUserRes = http.post(
      `${BASE_URL}/graphql`,
      '{"operationName":"FetchUserContext","variables":{},"query":"query FetchUserContext{self{id}}"}',
      {
        headers: {
        'Content-Type': 'application/json',
      },
      }
    )
    id = fetchUserRes.json('data').self.id
    check(fetchUserRes, { 'fetch user context': (r) => r.status == 200 })
  })

  group('lobby creation', function(){
    // route to lobby search
    let searchRes = http.get(`${BASE_URL}/app/LobbySearch`)
    check(searchRes, { 'lobby search status is 200': (r) => r.status == 200})

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
    lobby_id = createLobbyRes.json('data').createLobby
    check(createLobbyRes, { 'created lobby': (r) => r.status == 200 });

    // route to lobby page
    let lobbyRes = http.get(`${BASE_URL}/app/LobbyWait/lobby?lobbyId=${lobby_id}`)
    check(lobbyRes, { 'lobby wait status is 200': (r) => r.status == 200})
  })

  group('game', function(){
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
    let boardRes = http.get(`${BASE_URL}/app/board/game?lobbyId=${lobby_id}`)
    check(boardRes, { 'game board status is 200': (r) => r.status == 200})

    let leaveGameRes = http.post(
      `${BASE_URL}/graphql`,
      `{"operationName":"LeaveLobby","variables":{"userId":${id}},"query":"mutation LeaveLobby($userId: Int!) {leaveLobby(userId: $userId)}"}`,
      {
        headers: {
        'Content-Type': 'application/json',
      },
      }
    );
    check(leaveGameRes, {'left game': (r) => r.status == 200 });
  })

  group('logout', function(){
    let logoutRes = http.post(
      `${BASE_URL}/auth/logout`,
      {
        headers: {
          'Content-Type': 'application/json',
      },
      }
    );
    check(logoutRes, { 'logged out': (r) => r.status == 200 });
  })

}