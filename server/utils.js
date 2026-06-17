export function getBFSdistances(startId, connections) {
    const dist = {[startId]: 0};
    const queue = [startId];

    while (queue.length > 0) {
        const current = queue.shift();

        for (const conn of connections){
            let neighbour = null;
            if (conn.station_id_1 === current) neighbour = conn.station_id_2;
            if (conn.station_id_2 === current) neighbour = conn.station_id_1;

            if(neighbour !==null && dist[neighbour] === undefined) {
                dist[neighbour] = dist[current] + 1;
                queue.push(neighbour);
            }
        }
    }
    return dist;
}

export function validateRoute(submittedConnections, startStationId, destStationId, interchangeIds) {
    // order must be preserved
    if (submittedConnections.length === 0) {
        return false;
    }

    const connectionIds = submittedConnections.map(c => c.id);
    if (new Set(connectionIds).size !== connectionIds.length) {
        return false;
    }

    const firstConnection = submittedConnections[0];
    if (firstConnection.station_id_1 !== startStationId
        && firstConnection.station_id_2 !== startStationId) {
        return false;
    }

    let currentStationId = startStationId;
    let currentLineId = null;

    
    for (const connection of submittedConnections) {
        let nextStationId = null;
        if (connection.station_id_1 === currentStationId) {
            nextStationId = connection.station_id_2;
        } else if (connection.station_id_2 === currentStationId) {
            nextStationId = connection.station_id_1;
        }

        if (nextStationId === null) {
            return false;
        }

        if (currentLineId !== null && connection.line_id !== currentLineId
            && !interchangeIds.includes(currentStationId)) {
            return false;
        }
        currentStationId = nextStationId;
        currentLineId = connection.line_id;
    }
    return currentStationId === destStationId;
}