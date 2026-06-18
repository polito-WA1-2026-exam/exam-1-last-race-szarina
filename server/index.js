// imports
import express from "express";
import morgan from "morgan";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import {Strategy as LocalStrategy} from "passport-local";
import { getUser, getLines, getStations, getConnections, getSegments, createGame, submitRoute } from "./dao.js"

// init express
const app = express();
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
    saveUninitialized: false,
}))
app.use(passport.initialize())
app.use(passport.authenticate('session'))

// Authentication
passport.use(new LocalStrategy(function verify(username, password, callback){
    getUser(username , password).then((user) => {
        if (!user)
            return callback(null, false, {message: 'Incorrect username or password'});
        return callback(null, user);
    });
}));

passport.serializeUser(function (user, callback) {
    callback(null, user);
});

passport.deserializeUser(function (user, callback) {
    return callback(null, user);
})

const isLoggedIn =(req,res,next) => {
    if (req.isAuthenticated()){
        return next();
    }
    return res.status(401).json({error:'Not authenticated'})
};

// AUTH routes
app.post('/api/sessions', passport.authenticate('local'), (req, res)=> {
    res.json(req.user);
});

app.delete('/api/sessions/current', (req, res) => {
    req.logout(()=> {
        res.end();
    });
});

app.get('/api/sessions/current', (req, res) => {
    if (req.isAuthenticated()){
        res.json(req.user);
    } else {
        res.status(401).json({error: 'Not authenticated'});
    }
});

// NETWORK
app.get('/api/network', isLoggedIn, (req, res) =>{
    Promise.all([getLines(), getStations(), getConnections()])
        .then(([lines, stations, connections])=> {
            res.json({lines, stations, connections});
        })
            .catch(() => res.status(500).end());
});


app.get('/api/segments', isLoggedIn,  (req, res) => {
    getSegments()
        .then((segments) => res.json(segments))
        .catch(() => res.status(500).end());
});



// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});



