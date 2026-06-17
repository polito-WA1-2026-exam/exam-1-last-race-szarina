import sqlite3 from 'sqlite3';
import crypto from 'crypto';

const db = new sqlite3.Database('database.db', (err) => {
    if (err) throw err;
});

db.serialize(() => {

    // TABLES
    db.run(`CREATE TABLE IF NOT EXISTS User (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    salt          TEXT NOT NULL
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS Line (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS Station (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS Line_Station (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    line_id    INTEGER NOT NULL REFERENCES Line(id),
    station_id INTEGER NOT NULL REFERENCES Station(id),
    position   INTEGER NOT NULL,
    UNIQUE(line_id, station_id),
    UNIQUE(line_id, position)
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS Connection (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    line_id      INTEGER NOT NULL REFERENCES Line(id),
    station_id_1 INTEGER NOT NULL REFERENCES Station(id),
    station_id_2 INTEGER NOT NULL REFERENCES Station(id),
    CHECK(station_id_1 < station_id_2),
    UNIQUE(line_id, station_id_1, station_id_2)
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS Event (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT    NOT NULL,
    effect      INTEGER NOT NULL,
    CHECK(effect BETWEEN -4 AND 4)
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS Game (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id          INTEGER NOT NULL REFERENCES User(id),
    start_station_id INTEGER NOT NULL REFERENCES Station(id),
    dest_station_id  INTEGER NOT NULL REFERENCES Station(id),
    coins_final      INTEGER CHECK(coins_final >= 0),
    is_valid         INTEGER CHECK(is_valid IN (0,1)),
    created_at       TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS Game_Route_Segment (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id       INTEGER NOT NULL REFERENCES Game(id),
    connection_id INTEGER NOT NULL REFERENCES Connection(id),
    step_order    INTEGER NOT NULL,
    event_id      INTEGER REFERENCES Event(id),
    coins_after   INTEGER,
    UNIQUE(game_id, step_order),
    UNIQUE(game_id, connection_id)
  )`);

    // LINES
    db.run(`INSERT OR IGNORE INTO Line(name, color) VALUES ('Red Line',    '#C94A1E')`);
    db.run(`INSERT OR IGNORE INTO Line(name, color) VALUES ('Blue Line',   '#2272C3')`);
    db.run(`INSERT OR IGNORE INTO Line(name, color) VALUES ('Green Line',  '#4A8A14')`);
    db.run(`INSERT OR IGNORE INTO Line(name, color) VALUES ('Yellow Line', '#B07010')`);

    // STATIONS
    const stations = [
        'Alashan', 'Dostyk', 'Abai', 'Baiterek', 'Turan', 'Astana',
        'Esil', 'Shymkent', 'Otrar', 'Taldykorgan',
        'Balkash', 'Taraz', 'Zhayyq', 'Altai',
        'Nur', 'Saryarka',
        'Atyrau', 'Karagandy', 'Pavlodar'
    ];
    for (const name of stations) {
        db.run(`INSERT OR IGNORE INTO Station(name) VALUES (?)`, [name]);
    }

    // LINE_STATION
    const lineStations = [
        // Red Line: Alashan→Dostyk→Abai→Baiterek→Turan→Astana
        ['Red Line',    'Alashan',      1],
        ['Red Line',    'Dostyk',       2],
        ['Red Line',    'Abai',         3],
        ['Red Line',    'Baiterek',     4],
        ['Red Line',    'Turan',        5],
        ['Red Line',    'Astana',       6],
        // Blue Line: Esil→Dostyk→Shymkent→Otrar→Taldykorgan
        ['Blue Line',   'Esil',         1],
        ['Blue Line',   'Dostyk',       2],
        ['Blue Line',   'Shymkent',     3],
        ['Blue Line',   'Otrar',        4],
        ['Blue Line',   'Taldykorgan',  5],
        // Green Line: Balkash→Otrar→Taraz→Zhayyq→Altai
        ['Green Line',  'Balkash',      1],
        ['Green Line',  'Otrar',        2],
        ['Green Line',  'Taraz',        3],
        ['Green Line',  'Zhayyq',       4],
        ['Green Line',  'Altai',        5],
        // Yellow Line: Nur→Baiterek→Zhayyq→Saryarka
        ['Yellow Line', 'Nur',          1],
        ['Yellow Line', 'Baiterek',     2],
        ['Yellow Line', 'Zhayyq',       3],
        ['Yellow Line', 'Saryarka',     4],
        // Purple Line: Atyrau→Esil→Karagandy→Pavlodar→Nur
        ['Purple Line', 'Atyrau',    1],
        ['Purple Line', 'Esil',      2],
        ['Purple Line', 'Karagandy', 3],
        ['Purple Line', 'Pavlodar',  4],
        ['Purple Line', 'Nur',       5],
    ];
    for (const [line, station, position] of lineStations) {
        db.run(`
      INSERT OR IGNORE INTO Line_Station(line_id, station_id, position)
      VALUES (
        (SELECT id FROM Line    WHERE name = ?),
        (SELECT id FROM Station WHERE name = ?),
        ?
      )`, [line, station, position]);
    }

    //CONNECTIONS
    const connections = [
        // Red Line
        ['Red Line',    'Alashan',   'Dostyk'],
        ['Red Line',    'Dostyk',    'Abai'],
        ['Red Line',    'Abai',      'Baiterek'],
        ['Red Line',    'Baiterek',  'Turan'],
        ['Red Line',    'Turan',     'Astana'],
        // Blue Line
        ['Blue Line',   'Esil',      'Dostyk'],
        ['Blue Line',   'Dostyk',    'Shymkent'],
        ['Blue Line',   'Shymkent',  'Otrar'],
        ['Blue Line',   'Otrar',     'Taldykorgan'],
        // Green Line
        ['Green Line',  'Balkash',   'Otrar'],
        ['Green Line',  'Otrar',     'Taraz'],
        ['Green Line',  'Taraz',     'Zhayyq'],
        ['Green Line',  'Zhayyq',    'Altai'],
        // Yellow Line
        ['Yellow Line', 'Nur',       'Baiterek'],
        ['Yellow Line', 'Baiterek',  'Zhayyq'],
        ['Yellow Line', 'Zhayyq',    'Saryarka'],
        // Purple line
        ['Purple Line', 'Atyrau',    'Esil'],
        ['Purple Line', 'Esil',      'Karagandy'],
        ['Purple Line', 'Karagandy', 'Pavlodar'],
        ['Purple Line', 'Pavlodar',  'Nur'],
    ];
    for (const [line, s1, s2] of connections) {
        db.run(`
      INSERT OR IGNORE INTO Connection(line_id, station_id_1, station_id_2)
      SELECT
        (SELECT id FROM Line WHERE name = ?),
        CASE WHEN s1.id < s2.id THEN s1.id ELSE s2.id END,
        CASE WHEN s1.id < s2.id THEN s2.id ELSE s1.id END
      FROM
        (SELECT id FROM Station WHERE name = ?) AS s1,
        (SELECT id FROM Station WHERE name = ?) AS s2
    `, [line, s1, s2]);
    }

    // EVENTS
    const events = [
        ['Smooth ride, no issues',              0],
        ['Free tea at the station kiosk',       1],
        ['Kind passenger helped you',           1],
        ['Found a lucky coin on the seat',      2],
        ['You saw a cute cat',                  2],
        ['Express service, arrived early',      3],
        ['Upgrade to VIP seat',                 4],
        ['Someone gave you a free ticket',      4],
        ['Missed your stop',                   -1],
        ['Too many people, squashed',          -1],
        ['Wrong platform, lost time',          -2],
        ['Sudden emergency stop, dropped bag', -2],
        ['Pickpocket on the train',            -3],
        ['Metro delayed significantly',        -4],
    ];
    for (const [description, effect] of events) {
        db.run(`INSERT OR IGNORE INTO Event(description, effect) VALUES (?,?)`,
            [description, effect]);
    }

    //USERS
    const users = [
        ['alice',  'password123'],
        ['bob',    'password123'],
        ['zarina', 'password123'],
    ];
    for (const [username, password] of users) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.scryptSync(password, salt, 16);
        db.run(
            `INSERT OR IGNORE INTO User(username, password_hash, salt) VALUES (?,?,?)`,
            [username, hash.toString('hex'), salt]
        );
    }

    // SEEDED GAMES

    // alice: Alashan→Dostyk→Abai→Baiterek (Red Line, 3 segments)
    // 20 +1 = 21, +0 = 21, +2 = 23 → coins_final = 23
    db.run(`
    INSERT OR IGNORE INTO Game(user_id, start_station_id, dest_station_id, coins_final, is_valid, created_at)
    VALUES (
      (SELECT id FROM User    WHERE username = 'alice'),
      (SELECT id FROM Station WHERE name = 'Alashan'),
      (SELECT id FROM Station WHERE name = 'Baiterek'),
      23, 1, datetime('now', '-2 days')
    )
  `);
    db.run(`
    INSERT OR IGNORE INTO Game_Route_Segment(game_id, connection_id, step_order, event_id, coins_after)
    SELECT
      (SELECT id FROM Game WHERE user_id = (SELECT id FROM User WHERE username = 'alice')
       AND start_station_id = (SELECT id FROM Station WHERE name = 'Alashan') LIMIT 1),
      (SELECT id FROM Connection
       WHERE line_id      = (SELECT id FROM Line    WHERE name = 'Red Line')
       AND   station_id_1 = (SELECT id FROM Station WHERE name = 'Alashan')
       AND   station_id_2 = (SELECT id FROM Station WHERE name = 'Dostyk')),
      0,
      (SELECT id FROM Event WHERE description = 'Kind passenger helped you'),
      21
  `);
    db.run(`
    INSERT OR IGNORE INTO Game_Route_Segment(game_id, connection_id, step_order, event_id, coins_after)
    SELECT
      (SELECT id FROM Game WHERE user_id = (SELECT id FROM User WHERE username = 'alice')
       AND start_station_id = (SELECT id FROM Station WHERE name = 'Alashan') LIMIT 1),
      (SELECT id FROM Connection
       WHERE line_id      = (SELECT id FROM Line    WHERE name = 'Red Line')
       AND   station_id_1 = (SELECT id FROM Station WHERE name = 'Dostyk')
       AND   station_id_2 = (SELECT id FROM Station WHERE name = 'Abai')),
      1,
      (SELECT id FROM Event WHERE description = 'Smooth ride, no issues'),
      21
  `);
    db.run(`
    INSERT OR IGNORE INTO Game_Route_Segment(game_id, connection_id, step_order, event_id, coins_after)
    SELECT
      (SELECT id FROM Game WHERE user_id = (SELECT id FROM User WHERE username = 'alice')
       AND start_station_id = (SELECT id FROM Station WHERE name = 'Alashan') LIMIT 1),
      (SELECT id FROM Connection
       WHERE line_id      = (SELECT id FROM Line    WHERE name = 'Red Line')
       AND   station_id_1 = (SELECT id FROM Station WHERE name = 'Abai')
       AND   station_id_2 = (SELECT id FROM Station WHERE name = 'Baiterek')),
      2,
      (SELECT id FROM Event WHERE description = 'Found a lucky coin on the seat'),
      23
  `);

    // bob: Esil→Dostyk→Shymkent→Otrar (Blue Line, 3 segments)
    // 20 -2 = 18, +0 = 18, -1 = 17 → coins_final = 17
    db.run(`
    INSERT OR IGNORE INTO Game(user_id, start_station_id, dest_station_id, coins_final, is_valid, created_at)
    VALUES (
      (SELECT id FROM User    WHERE username = 'bob'),
      (SELECT id FROM Station WHERE name = 'Esil'),
      (SELECT id FROM Station WHERE name = 'Otrar'),
      17, 1, datetime('now', '-1 days')
    )
  `);
    db.run(`
    INSERT OR IGNORE INTO Game_Route_Segment(game_id, connection_id, step_order, event_id, coins_after)
    SELECT
      (SELECT id FROM Game WHERE user_id = (SELECT id FROM User WHERE username = 'bob')
       AND start_station_id = (SELECT id FROM Station WHERE name = 'Esil') LIMIT 1),
      (SELECT id FROM Connection
       WHERE line_id      = (SELECT id FROM Line    WHERE name = 'Blue Line')
       AND   station_id_1 = (SELECT id FROM Station WHERE name = 'Dostyk')
       AND   station_id_2 = (SELECT id FROM Station WHERE name = 'Esil')),
      0,
      (SELECT id FROM Event WHERE description = 'Wrong platform, lost time'),
      18
  `);
    db.run(`
    INSERT OR IGNORE INTO Game_Route_Segment(game_id, connection_id, step_order, event_id, coins_after)
    SELECT
      (SELECT id FROM Game WHERE user_id = (SELECT id FROM User WHERE username = 'bob')
       AND start_station_id = (SELECT id FROM Station WHERE name = 'Esil') LIMIT 1),
      (SELECT id FROM Connection
       WHERE line_id      = (SELECT id FROM Line    WHERE name = 'Blue Line')
       AND   station_id_1 = (SELECT id FROM Station WHERE name = 'Dostyk')
       AND   station_id_2 = (SELECT id FROM Station WHERE name = 'Shymkent')),
      1,
      (SELECT id FROM Event WHERE description = 'Smooth ride, no issues'),
      18
  `);
    db.run(`
    INSERT OR IGNORE INTO Game_Route_Segment(game_id, connection_id, step_order, event_id, coins_after)
    SELECT
      (SELECT id FROM Game WHERE user_id = (SELECT id FROM User WHERE username = 'bob')
       AND start_station_id = (SELECT id FROM Station WHERE name = 'Esil') LIMIT 1),
      (SELECT id FROM Connection
       WHERE line_id      = (SELECT id FROM Line    WHERE name = 'Blue Line')
       AND   station_id_1 = (SELECT id FROM Station WHERE name = 'Shymkent')
       AND   station_id_2 = (SELECT id FROM Station WHERE name = 'Otrar')),
      2,
      (SELECT id FROM Event WHERE description = 'Missed your stop'),
      17
  `);

    console.log('Database seeded successfully.');
});

export default db;