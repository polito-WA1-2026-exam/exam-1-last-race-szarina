// imports
import express from "express";
import morgan from "morgan";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import {Strategy as LocalStrategy} from "passport-local";
import { verifiyPassword, getUserById} from "./dao.js"

// init express
const app = new express();
const port = 3001;

// middleware
app.use(express.json())
app.use(morgan('dev'))

const corsOptions = {
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200,
    credentials: true,
}
app.use(cors(corsOptions))

app.use(session({
    secret: 'last-race-secret',
    resave: false,
    saveUninitialized: true,
}))
app.use([passport.initialize()])
app.use(passport.authenticate('session'))

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

