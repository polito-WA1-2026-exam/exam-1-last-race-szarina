export class GameAlreadySubmittedError extends Error {
    constructor(message = 'This game has already been submitted') {
        super(message);
        this.name = 'GameAlreadySubmittedError';
    }
}

export class NoReachableDestinationError extends Error {
    constructor(message = 'No reachable destination found for this start station') {
        super(message);
        this.name = 'NoReachableDestinationError';
    }
}