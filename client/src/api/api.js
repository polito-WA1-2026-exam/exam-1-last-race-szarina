const SERVER_URL = 'http://localhost:3001'

async function getNetwork() {
    const response = await fetch(`${SERVER_URL}/api/network`, {
        credentials: 'include'
    })
    if (response.ok) {
        return await response.json()
    } else {
        const errorBody = await response.json()
        throw new Error(errorBody.error || "Failed to fetch network")
    }
}

async function getSegments() {
    const response = await fetch(`${SERVER_URL}/api/segments`, {
        credentials: 'include'
    })
    if (response.ok) {
        return await response.json()
    } else {
        const errorBody = await response.json()
        throw new Error(errorBody.error || "Failed to fetch segments")
    }
}

async function createGame() {
    const response = await fetch(`${SERVER_URL}/api/games`, {
        method: 'POST',
        credentials: 'include'
    })
    if (response.ok) {
        return await response.json()
    } else {
        const errorBody = await response.json()
        throw new Error(errorBody.error || "Failed to create game")
    }
}

async function submitRoute(gameId, connectionIds) {
    const response = await fetch(`${SERVER_URL}/api/games/${gameId}/route`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ connection_ids: connectionIds })
    })
    if (response.ok) {
        return await response.json()
    } else {
        const errorBody = await response.json()
        throw new Error(errorBody.error || "Failed to submit route")
    }
}

async function getRanking() {
    const response = await fetch(`${SERVER_URL}/api/ranking`, {
        credentials: 'include'
    })
    if (response.ok) {
        return await response.json()
    } else {
        const errorBody = await response.json()
        throw new Error(errorBody.error || "Failed to fetch ranking")
    }
}

async function getStations() {
    const response = await fetch(`${SERVER_URL}/api/stations`, {
        credentials: 'include'
    })
    if (response.ok) {
        return await response.json()
    } else {
        const errorBody = await response.json()
        throw new Error(errorBody.error || "Failed to fetch stations")
    }
}

export { getNetwork, getSegments, createGame, submitRoute, getRanking , getStations}