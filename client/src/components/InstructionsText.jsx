function InstructionsText() {
    return (
        <div>
            <p>You'll be assigned a starting station and a destination station on the metro network.</p>
            <p>During the Planning phase, you have 90 seconds to select segments (in order) to build a route from your
                start to your destination.</p>
            <p>Once submitted, your route is checked: each segment must connect properly, and you can only switch lines
                at interchange stations.</p>
            <p>If valid, you'll travel through it step by step, encountering random events that add or subtract
                coins.</p>
            <p>If invalid or incomplete, you lose all your coins.</p>
            <p>You start with 20 coins. Try to finish with as many as possible!</p>
        </div>
    )
}

export default InstructionsText