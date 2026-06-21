import sqlite3 from 'sqlite3';
import crypto from 'crypto';

const db = new sqlite3.Database('database.db', (err) => {
    if (err) throw err;
});

// Promise-wrapped helpers
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

async function setupSchema() {
    await run(`CREATE TABLE IF NOT EXISTS users (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        username      TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        salt          TEXT NOT NULL
      )`);

    await run(`CREATE TABLE IF NOT EXISTS lines (
        id    INTEGER PRIMARY KEY AUTOINCREMENT,
        name  TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL
      )`);

    await run(`CREATE TABLE IF NOT EXISTS stations (
        id   INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      )`);

    await run(`CREATE TABLE IF NOT EXISTS line_stations (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        line_id    INTEGER NOT NULL REFERENCES lines(id),
        station_id INTEGER NOT NULL REFERENCES stations(id),
        position   INTEGER NOT NULL,
        UNIQUE(line_id, station_id),
        UNIQUE(line_id, position)
      )`);

    await run(`CREATE TABLE IF NOT EXISTS connections (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        line_id      INTEGER NOT NULL REFERENCES lines(id),
        station_id_1 INTEGER NOT NULL REFERENCES stations(id),
        station_id_2 INTEGER NOT NULL REFERENCES stations(id),
        CHECK(station_id_1 < station_id_2),
        UNIQUE(line_id, station_id_1, station_id_2)
      )`);

    await run(`CREATE TABLE IF NOT EXISTS events (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT    NOT NULL,
        effect      INTEGER NOT NULL,
        CHECK(effect BETWEEN -4 AND 4)
      )`);

    await run(`CREATE TABLE IF NOT EXISTS games (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id          INTEGER NOT NULL REFERENCES users(id),
        start_station_id INTEGER NOT NULL REFERENCES stations(id),
        dest_station_id  INTEGER NOT NULL REFERENCES stations(id),
        coins_final      INTEGER CHECK(coins_final >= 0),
        is_valid         INTEGER CHECK(is_valid IN (0,1)),
        created_at       TEXT NOT NULL DEFAULT (datetime('now'))
      )`);

    await run(`CREATE TABLE IF NOT EXISTS game_route_segments (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id       INTEGER NOT NULL REFERENCES games(id),
        connection_id INTEGER NOT NULL REFERENCES connections(id),
        step_order    INTEGER NOT NULL,
        event_id      INTEGER REFERENCES events(id),
        coins_after   INTEGER,
        UNIQUE(game_id, step_order),
        UNIQUE(game_id, connection_id)
      )`);
}

async function seedData() {
    const userCount = await get(`SELECT COUNT(*) AS count FROM users`);
    if (userCount.count > 0) {
        console.log('Database already seeded, skipping.');
        return;
    }

    // LINES
    const lineSeeds = [
        ['Red Line', '#C0533B'],
        ['Blue Line', '#3D7AB5'],
        ['Green Line', '#5E8C4E'],
        ['Yellow Line', '#C9912E'],
        ['Purple Line', '#8A6BA8'],
    ];
    for (const [name, color] of lineSeeds) {
        await run(`INSERT OR IGNORE INTO lines(name, color) VALUES (?, ?)`, [name, color]);
    }

    // STATIONS
    const stationSeeds = [
        'Alashan', 'Dostyk', 'Abai', 'Baiterek', 'Turan', 'Astana',
        'Esil', 'Shymkent', 'Otrar', 'Taldykorgan',
        'Balkash', 'Taraz', 'Zhayyq', 'Altai',
        'Nur', 'Saryarka',
        'Atyrau', 'Karagandy', 'Pavlodar',
    ];
    for (const name of stationSeeds) {
        await run(`INSERT OR IGNORE INTO stations(name) VALUES (?)`, [name]);
    }

    const lineRows = await all(`SELECT id, name FROM lines`);
    const lineIdByName = Object.fromEntries(lineRows.map(l => [l.name, l.id]));

    const stationRows = await all(`SELECT id, name FROM stations`);
    const stationIdByName = Object.fromEntries(stationRows.map(s => [s.name, s.id]));

    // LINE_STATIONS
    const lineStations = [
        ['Red Line', 'Alashan', 1],
        ['Red Line', 'Dostyk', 2],
        ['Red Line', 'Abai', 3],
        ['Red Line', 'Baiterek', 4],
        ['Red Line', 'Turan', 5],
        ['Red Line', 'Astana', 6],
        ['Blue Line', 'Esil', 1],
        ['Blue Line', 'Dostyk', 2],
        ['Blue Line', 'Shymkent', 3],
        ['Blue Line', 'Otrar', 4],
        ['Blue Line', 'Taldykorgan', 5],
        ['Green Line', 'Balkash', 1],
        ['Green Line', 'Otrar', 2],
        ['Green Line', 'Taraz', 3],
        ['Green Line', 'Zhayyq', 4],
        ['Green Line', 'Altai', 5],
        ['Yellow Line', 'Nur', 1],
        ['Yellow Line', 'Baiterek', 2],
        ['Yellow Line', 'Zhayyq', 3],
        ['Yellow Line', 'Saryarka', 4],
        ['Purple Line', 'Atyrau', 1],
        ['Purple Line', 'Esil', 2],
        ['Purple Line', 'Karagandy', 3],
        ['Purple Line', 'Pavlodar', 4],
        ['Purple Line', 'Nur', 5],
    ];

    for (const [line, station, position] of lineStations) {
        const lineId = lineIdByName[line];
        const stationId = stationIdByName[station];
        if (!lineId || !stationId) {
            console.error(`MISSING lookup for line_station: ${line} / ${station}`);
            continue;
        }
        await run(
            `INSERT OR IGNORE INTO line_stations(line_id, station_id, position) VALUES (?, ?, ?)`,
            [lineId, stationId, position]
        );
    }

    // CONNECTIONS
    const connectionSeeds = [
        ['Red Line', 'Alashan', 'Dostyk'],
        ['Red Line', 'Dostyk', 'Abai'],
        ['Red Line', 'Abai', 'Baiterek'],
        ['Red Line', 'Baiterek', 'Turan'],
        ['Red Line', 'Turan', 'Astana'],
        ['Blue Line', 'Esil', 'Dostyk'],
        ['Blue Line', 'Dostyk', 'Shymkent'],
        ['Blue Line', 'Shymkent', 'Otrar'],
        ['Blue Line', 'Otrar', 'Taldykorgan'],
        ['Green Line', 'Balkash', 'Otrar'],
        ['Green Line', 'Otrar', 'Taraz'],
        ['Green Line', 'Taraz', 'Zhayyq'],
        ['Green Line', 'Zhayyq', 'Altai'],
        ['Yellow Line', 'Nur', 'Baiterek'],
        ['Yellow Line', 'Baiterek', 'Zhayyq'],
        ['Yellow Line', 'Zhayyq', 'Saryarka'],
        ['Purple Line', 'Atyrau', 'Esil'],
        ['Purple Line', 'Esil', 'Karagandy'],
        ['Purple Line', 'Karagandy', 'Pavlodar'],
        ['Purple Line', 'Pavlodar', 'Nur'],
    ];

    for (const [line, s1, s2] of connectionSeeds) {
        const lineId = lineIdByName[line];
        const id1 = stationIdByName[s1];
        const id2 = stationIdByName[s2];
        if (!lineId || !id1 || !id2) {
            console.error(`MISSING lookup for connection: ${line} / ${s1}-${s2}`);
            continue;
        }
        const [a, b] = id1 < id2 ? [id1, id2] : [id2, id1];
        await run(
            `INSERT OR IGNORE INTO connections(line_id, station_id_1, station_id_2) VALUES (?, ?, ?)`,
            [lineId, a, b]
        );
    }

    //EVENTS
    const eventSeeds = [
        ['No problems happened', 0],
        ['Nothing special happened', 0],
        ['Free tea at the station kiosk', 1],
        ['Kind passenger helped you', 1],
        ['Found a lucky coin on the seat', 2],
        ['You saw a cute cat', 2],
        ['A lot of empty seats', 2],
        ['Express service, arrived early', 3],
        ['Upgrade to VIP seat', 4],
        ['Someone gave you a free ticket', 4],
        ['Missed your stop', -1],
        ['Too many people, squashed', -1],
        ['Wrong platform, lost time', -2],
        ['Phone battery died, missed an alert', -2],
        ['Sudden emergency stop, dropped bag', -2],
        ['Pickpocket on the train', -3],
        ['Spilled coffee on your jacket', -3],
        ['Metro delayed significantly', -4],
    ];
    for (const [description, effect] of eventSeeds) {
        await run(`INSERT OR IGNORE INTO events(description, effect) VALUES (?, ?)`, [description, effect]);
    }

    // USERS
    const userSeeds = [
        ['aruzhan', 'password123'],
        ['nurlan', 'password123'],
        ['zarina', 'password123'],
    ];
    for (const [username, password] of userSeeds) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.scryptSync(password, salt, 16);
        await run(
            `INSERT OR IGNORE INTO users(username, password_hash, salt) VALUES (?, ?, ?)`,
            [username, hash.toString('hex'), salt]
        );
    }

    // ── SEEDED GAMES ──
    // aruzhan: Alashan→Dostyk→Abai→Baiterek (Red Line, 3 segments)
    await run(`
        INSERT OR IGNORE INTO games(user_id, start_station_id, dest_station_id, coins_final, is_valid, created_at)
        VALUES (
          (SELECT id FROM users    WHERE username = 'aruzhan'),
          (SELECT id FROM stations WHERE name = 'Alashan'),
          (SELECT id FROM stations WHERE name = 'Baiterek'),
          23, 1, datetime('now', '-2 days')
        )
    `);
    await run(`
        INSERT OR IGNORE INTO game_route_segments(game_id, connection_id, step_order, event_id, coins_after)
        SELECT (SELECT id FROM games WHERE user_id = (SELECT id FROM users WHERE username = 'aruzhan')
                AND start_station_id = (SELECT id FROM stations WHERE name = 'Alashan') LIMIT 1),
               (SELECT id FROM connections
                WHERE line_id = (SELECT id FROM lines WHERE name = 'Red Line')
                AND station_id_1 = (SELECT id FROM stations WHERE name = 'Alashan')
                AND station_id_2 = (SELECT id FROM stations WHERE name = 'Dostyk')),
               0,
               (SELECT id FROM events WHERE description = 'Kind passenger helped you'),
               21
    `);
    await run(`
        INSERT OR IGNORE INTO game_route_segments(game_id, connection_id, step_order, event_id, coins_after)
        SELECT (SELECT id FROM games WHERE user_id = (SELECT id FROM users WHERE username = 'aruzhan')
                AND start_station_id = (SELECT id FROM stations WHERE name = 'Alashan') LIMIT 1),
               (SELECT id FROM connections
                WHERE line_id = (SELECT id FROM lines WHERE name = 'Red Line')
                AND station_id_1 = (SELECT id FROM stations WHERE name = 'Dostyk')
                AND station_id_2 = (SELECT id FROM stations WHERE name = 'Abai')),
               1,
               (SELECT id FROM events WHERE description = 'No problems happened'),
               21
    `);
    await run(`
        INSERT OR IGNORE INTO game_route_segments(game_id, connection_id, step_order, event_id, coins_after)
        SELECT (SELECT id FROM games WHERE user_id = (SELECT id FROM users WHERE username = 'aruzhan')
                AND start_station_id = (SELECT id FROM stations WHERE name = 'Alashan') LIMIT 1),
               (SELECT id FROM connections
                WHERE line_id = (SELECT id FROM lines WHERE name = 'Red Line')
                AND station_id_1 = (SELECT id FROM stations WHERE name = 'Abai')
                AND station_id_2 = (SELECT id FROM stations WHERE name = 'Baiterek')),
               2,
               (SELECT id FROM events WHERE description = 'Found a lucky coin on the seat'),
               23
    `);

    // nurlan: Esil→Dostyk→Shymkent→Otrar (Blue Line, 3 segments)
    await run(`
        INSERT OR IGNORE INTO games(user_id, start_station_id, dest_station_id, coins_final, is_valid, created_at)
        VALUES (
          (SELECT id FROM users    WHERE username = 'nurlan'),
          (SELECT id FROM stations WHERE name = 'Esil'),
          (SELECT id FROM stations WHERE name = 'Otrar'),
          17, 1, datetime('now', '-1 days')
        )
    `);
    await run(`
        INSERT OR IGNORE INTO game_route_segments(game_id, connection_id, step_order, event_id, coins_after)
        SELECT (SELECT id FROM games WHERE user_id = (SELECT id FROM users WHERE username = 'nurlan')
                AND start_station_id = (SELECT id FROM stations WHERE name = 'Esil') LIMIT 1),
               (SELECT id FROM connections
                WHERE line_id = (SELECT id FROM lines WHERE name = 'Blue Line')
                AND station_id_1 = (SELECT id FROM stations WHERE name = 'Dostyk')
                AND station_id_2 = (SELECT id FROM stations WHERE name = 'Esil')),
               0,
               (SELECT id FROM events WHERE description = 'Wrong platform, lost time'),
               18
    `);
    await run(`
        INSERT OR IGNORE INTO game_route_segments(game_id, connection_id, step_order, event_id, coins_after)
        SELECT (SELECT id FROM games WHERE user_id = (SELECT id FROM users WHERE username = 'nurlan')
                AND start_station_id = (SELECT id FROM stations WHERE name = 'Esil') LIMIT 1),
               (SELECT id FROM connections
                WHERE line_id = (SELECT id FROM lines WHERE name = 'Blue Line')
                AND station_id_1 = (SELECT id FROM stations WHERE name = 'Dostyk')
                AND station_id_2 = (SELECT id FROM stations WHERE name = 'Shymkent')),
               1,
               (SELECT id FROM events WHERE description = 'No problems happened'),
               18
    `);
    await run(`
        INSERT OR IGNORE INTO game_route_segments(game_id, connection_id, step_order, event_id, coins_after)
        SELECT (SELECT id FROM games WHERE user_id = (SELECT id FROM users WHERE username = 'nurlan')
                AND start_station_id = (SELECT id FROM stations WHERE name = 'Esil') LIMIT 1),
               (SELECT id FROM connections
                WHERE line_id = (SELECT id FROM lines WHERE name = 'Blue Line')
                AND station_id_1 = (SELECT id FROM stations WHERE name = 'Shymkent')
                AND station_id_2 = (SELECT id FROM stations WHERE name = 'Otrar')),
               2,
               (SELECT id FROM events WHERE description = 'Missed your stop'),
               17
    `);

    console.log('Database seeded successfully.');
}

await setupSchema();
await seedData();

export default db;