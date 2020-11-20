-- create users
insert into `user` (`email`, `name`) values ('a@ucla.edu', 'Mr. A');
insert into `user` (`email`, `name`) values ('b@ucla.edu', 'Mr. B');
insert into `user` (`email`, `name`) values ('c@ucla.edu', 'Mr. C');

-- create a lobby
insert into `lobby` (`maxUsers`, `gameTime`) values (3, 60);

-- create players linked to those users
insert into `player` (`userId`, `lobbyId`) values (2, 1);
insert into `player` (`userId`, `lobbyId`) values (3, 1);
insert into `player` (`userId`, `lobbyId`) values (4, 1);

-- -- update users with FK
UPDATE user INNER JOIN player ON user.id = player.userId SET user.playerId = player.id;

-- make a tile and move
insert into `move` (`lobbyId`, `playerId`, `moveType`) values (1, 1, 'SpawnTiles');
insert into `tile` (`location`, `letter`, `value`, `moveId`) values (0, 'A', 1, 1);
insert into `tile` (`location`, `letter`, `value`, `moveId`) values (1, 'B', 1, 1);
insert into `tile` (`location`, `letter`, `value`, `moveId`) values (2, 'C', 1, 1);
insert into `tile` (`location`, `letter`, `value`, `moveId`) values (3, 'D', 1, 1);
insert into `tile` (`location`, `letter`, `value`, `moveId`) values (4, 'E', 1, 1);
insert into `tile` (`location`, `letter`, `value`, `moveId`) values (5, 'F', 1, 1);
insert into `tile` (`location`, `letter`, `value`, `moveId`) values (6, 'G', 1, 1);
insert into `tile` (`location`, `letter`, `value`, `moveId`) values (7, 'H', 1, 1);
insert into `tile` (`location`, `letter`, `value`, `moveId`) values (8, 'I', 1, 1);
insert into `tile` (`location`, `letter`, `value`, `moveId`) values (9, 'J', 1, 1);
insert into `tile` (`location`, `letter`, `value`, `moveId`) values (10, 'K', 1, 1);
insert into `tile` (`location`, `letter`, `value`, `moveId`) values (11, 'L', 1, 1);
insert into `tile` (`location`, `letter`, `value`, `moveId`) values (12, 'M', 1, 1);
insert into `tile` (`location`, `letter`, `value`, `moveId`) values (13, 'N', 1, 1);
insert into `tile` (`location`, `letter`, `value`, `moveId`) values (14, 'O', 1, 1);
insert into `tile` (`location`, `letter`, `value`, `moveId`, `tileType`) values (15, 'P', 1, 1, 'Dud');