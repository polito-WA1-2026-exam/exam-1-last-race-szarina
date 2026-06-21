import {useState, useEffect} from "react"
import {getSegments, getStations} from "../api/api.js"
import NetworkMap from "./NetworkMap.jsx"


function PlanningPhase({startStation, destStation, onSubmitRoute}) {
    const [segments, setSegments] = useState([])
    const [stations, setStations] = useState([])
    const [selectedIds, setSelectedIds] = useState([])
    const [timeLeft, setTimeLeft] = useState(90)

    useEffect(() => {
        getSegments().then(setSegments)
        getStations().then(setStations)
    }, [])

    useEffect(() => {
        if (timeLeft <= 0) {
            onSubmitRoute(selectedIds)
            return
        }
        const timeout = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
        return () => clearTimeout(timeout)
    }, [timeLeft])

    const handleSelectSegment = (segment) => {
        setSelectedIds([...selectedIds, segment.id])
    }

    const handleRemoveLast = () => {
        setSelectedIds(selectedIds.slice(0, -1))
    }

    const handleManualSubmit = () => {
        if (selectedIds.length === 0) {
            return
        }
        onSubmitRoute(selectedIds)
    }

    return (
        <div className="planning-layout">
            <div className="planning-header">
                <span className="badge-pill">Time left: {timeLeft}s</span>
                <h3>From {startStation.name} to {destStation.name}</h3>
            </div>

            <div className="planning-grid">
                <div className="card-surface planning-map">
                    <NetworkMap stations={stations} mode="dots-only"/>
                </div>

                <div className="card-surface">
                    <h4>Available segments</h4>
                    <div className="segment-list">
                        {segments.map((seg) => (
                            <button key={seg.id} className="btn-outline-gold segment-btn"
                                    onClick={() => handleSelectSegment(seg)} disabled={selectedIds.includes(seg.id)}>
                                {seg.station_1} — {seg.station_2}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card-surface route-full-width">
                <h4>Your route</h4>
                <div className="segment-list">
                    {selectedIds.map((id) => {
                        const seg = segments.find(s => s.id === id)
                        return <span key={id} className="badge-pill route-step">{seg.station_1} — {seg.station_2}</span>
                    })}
                </div>
            </div>

            <div className="route-actions">
                {selectedIds.length > 0 && (
                    <button className="btn-outline-gold" onClick={handleRemoveLast}>Remove last</button>
                )}
                <button className="btn-gold" onClick={handleManualSubmit} disabled={selectedIds.length === 0}>Submit
                    route
                </button>
            </div>
        </div>
    )
}

export default PlanningPhase