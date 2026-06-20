import db from './db.js';
import crypto from 'crypto'

import {getBFSdistances, validateRoute} from './utils.js'
import {GameAlreadySubmittedError, NoReachableDestinationError} from "./errors.js";

// Auth functions
export const getUser = (username, password) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT *
                FROM users
                WHERE username = ?`, [username], (err, row) => {
            if (err) reject(err);
            else if (!row) resolve(false);
            else {
                crypto.scrypt(password, row.salt, 16, (err, hash) => {
                    if (err) return reject(err);
                    if (!crypto.timingSafeEqual(Buffer.from(row.password_hash, 'hex'), hash))
                        resolve(false);
                    else
                        resolve({id: row.id, username: row.username});
                });
            }
        });
    })
};

// Network
export const getLines = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id, name, color
                     FROM lines`;
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};


export const getStations = () => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT s.id,
                   s.name,
                   (SELECT COUNT(DISTINCT ls.line_id)
                    FROM line_stations ls
                    WHERE ls.station_id = s.id) > 1 AS is_interchange
            FROM stations s
            ORDER BY s.name
        `;
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};


export const getConnections = () => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT c.id,
                   c.line_id,
                   c.station_id_1,
                   c.station_id_2,
                   s1.name AS station_1,
                   s2.name AS station_2
            FROM connections c
                     JOIN stations s1 ON c.station_id_1 = s1.id
                     JOIN stations s2 ON c.station_id_2 = s2.id
        `;
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// For getting segments during the game
export const getSegments = () => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT c.id,
                   s1.name as station_1,
                   s2.name as station_2
            FROM connections c
                     JOIN stations s1 ON c.station_id_1 = s1.id
                     JOIN stations s2 ON c.station_id_2 = s2.id
            ORDER BY s1.name, s2.name
        `;
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};


// Starting the game
export const createGame = async (userId) => {
    const stations = await getStations();
    const connections = await getConnections();

    // random start dest
    const startStation = stations[Math.floor(Math.random() * stations.length)];

    // BFS
    const distances = getBFSdistances(startStation.id, connections);

    // filtering distance > 3;
    const reachableStations = stations.filter(s => distances[s.id] >= 3);

    // normally shouldnt happen
    if (!reachableStations.length)
        throw new NoReachableDestinationError();

    const destStation = reachableStations[Math.floor(Math.random() * reachableStations.length)];

    // new game
    const gameId = await new Promise((resolve, reject) => {
        const sql = `INSERT INTO games(user_id, start_station_id, dest_station_id)
                     VALUES (?, ?, ?)`;
        db.run(sql, [userId, startStation.id, destStation.id], function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });

    return {gameId, startStation, destStation};

}


// Random event
export const getRandomEvent = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id, description, effect
                     FROM events
                     ORDER BY RANDOM() LIMIT 1`;
        db.get(sql, [], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};


// inserting game steps history
export const insertGameSegment = (gameId, connectionId, stepOrder, eventId, coinsAfter) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO game_route_segments(game_id, connection_id, step_order, event_id, coins_after)
            VALUES (?, ?, ?, ?, ?)`;
        db.run(sql, [gameId, connectionId, stepOrder, eventId, coinsAfter], function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
};


// Final game result
export const updateGameResult = (gameId, coinsFinal, isValid) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE games
                     SET coins_final = ?,
                         is_valid    = ?
                     WHERE id = ?`;
        db.run(sql, [coinsFinal, isValid, gameId], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

// gets Connection objects from connection_ids for submitting the user route
export const getConnectionsByIds = async (ids_list) => {
    if (!Array.isArray(ids_list) || ids_list.length === 0) {
        return [];
    }
    // i do this because i need to preserve the order of connections
    const allConnections = await getConnections();
    const connectionMap = new Map(allConnections.map(c => [c.id, c]));
    return ids_list.map((id) => connectionMap.get(id));
};

// for submitRoute
export const getInterchangeStationIds = () => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT station_id
            FROM line_stations
            GROUP BY station_id
            HAVING COUNT(DISTINCT line_id) > 1
        `;
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map(r => r.station_id));
        });
    });
};


// Submit
// connectionIds must be sent in order
export const submitRoute = async (game, connectionIds) => {
    if (game.is_valid !== null) {
        throw new GameAlreadySubmittedError();
    }

    const submittedConnections = await getConnectionsByIds(connectionIds);
    const interchangeIds = await getInterchangeStationIds();
    const allStations = await getStations();
    const stationNames = Object.fromEntries(allStations.map(s => [s.id, s.name]))

    const validation = validateRoute(submittedConnections,
        game.start_station_id,
        game.dest_station_id,
        interchangeIds,
        stationNames);

    if (!validation.valid) {
        await updateGameResult(game.id, 0, 0);
        return {valid: false, reason: validation.reason};
    }

    let coins = 20;
    const steps = [];

    for (let i = 0; i < submittedConnections.length; i++) {
        const connection = submittedConnections[i];
        const event = await getRandomEvent();
        coins = coins + event.effect;

        await insertGameSegment(game.id, connection.id, i, event.id, coins);

        steps.push({
            step_order: i,
            connection_id: connection.id,
            from_station: connection.station_1,
            to_station: connection.station_2,
            event_description: event.description,
            event_effect: event.effect,
            coins_after: coins
        });
    }

    const coinsFinal = Math.max(0, coins);
    await updateGameResult(game.id, coinsFinal, 1);

    return {valid: true, steps, coins_final: coinsFinal};

}

// get  game
export const getGame = (gameId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT g.id,
                   g.user_id,
                   g.start_station_id,
                   g.dest_station_id,
                   g.coins_final,
                   g.is_valid,
                   s1.name AS start_station_name,
                   s2.name AS dest_station_name
            FROM games g
                     JOIN stations s1 ON g.start_station_id = s1.id
                     JOIN stations s2 ON g.dest_station_id = s2.id
            WHERE g.id = ?`;
        db.get(sql, [gameId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};


// for ranks
export const getRanking = () => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT u.username,
                   MAX(g.coins_final) as best_score
            FROM games g
                     JOIN users u ON g.user_id = u.id
            WHERE g.is_valid = 1
            GROUP BY g.user_id
            ORDER BY best_score DESC`;
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};