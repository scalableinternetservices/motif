/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import http from 'k6/http'
import { check, group, sleep, fail } from 'k6'
import { Counter, Rate } from 'k6/metrics'

export const options = {
  scenarios: {
    scenario1: {
      executor: 'ramping-arrival-rate',
      startRate: '10',
      //timeUnit: '1s',
      preAllocatedVUS: 65,
      maxVUs: 100,
      gracefulStop: '110s',
      stages: [
        { target: 5, duration: '10s' },
        // { target: 20, duration: '10s' },
        // { target: 0, duration: '10s' },
      ],
    },
  },
}
//{"operationName":"MakeMove","variables":{"input":{"playerId":1,"lobbyId":1,"time":21783,"moveType":"Submit","tiles":[{"letter":"S","pointValue":1,"tileType":"Normal","location":1},{"letter":"E","pointValue":1,"tileType":"Normal","location":2},{"letter":"E","pointValue":1,"tileType":"Normal","location":3}],"pointValue":3}},"query":"mutation MakeMove($input: MoveInput!) {  makeMove(input: $input)}"}
function randomString(length) {
  const charset = 'abcdefghijklmnopqrstuvwxyz';
  let res = '';
  while (length--) res += charset[(Math.random() * charset.length) | 0];
  return res;
}
export default function () {
  const BASE_URL = 'http://localhost:3000'

  // route to board page
  http.get(`${BASE_URL}/app/board`)
  sleep(5)

  // click move
  // let makeMoveRes = http.post(
  //   `${BASE_URL}/graphql`,
  //   `{"operationName":"MakeMove","variables":{"input":{"playerId":1,"lobbyId":1,"time":6828,"moveType":"DeselectTile","tiles":[{"letter":"E","pointValue":1,"tileType":"Normal","location":0}],"pointValue":0}},"query":"mutation MakeMove($input: MoveInput!) {makeMove(input: $input)}"}`,
  //   {
  //     headers: {
  //     'Content-Type': 'application/json',
  //    },
  //   }
  // );
  //check(makeMoveRes, { 'move made': (r) => r.status == 200 });
  //sleep(1);
}
