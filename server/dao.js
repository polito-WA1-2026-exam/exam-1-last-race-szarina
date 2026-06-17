import db from './db.js';
import crypto from 'crypto'

export const getUser = (username, password) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT *
                FROM users
                WHERE isername = ?`, [username], (err, row)=> {
            if (err) reject(err);
            else if (!row) resolve(false);
            else {
                crypto.scrypt(password, row.salt, 16, (err, hash) => {
                    if (err) reject(err);
                    if (!crypto.timingSafeEqual(Buffer.from(row.password_hash, 'hex'), 'hash'))
                        resolve(false);
                    else
                        resolve({id: row.id, username: row.username});
                });
            }
        });
    })
};


export const getUserById = (id) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT id, username FROM Users WHERE id=${id}`, [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        })
    })
}