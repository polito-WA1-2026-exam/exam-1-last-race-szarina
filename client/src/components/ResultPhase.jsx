function ResultPhase({ finalCoins, onPlayAgain, invalidReason }) {
    return (
        <>
            {invalidReason ?(
                <>
                    <h2>Invalid route</h2>
                    <p>{invalidReason}</p>
                    <p>You lost all your coins</p>
                </>
            ):(
                <>
                    <h2>Journey complete!</h2>
                    <p>You arrived safely.</p>
                </>
                )}
            <h3>Final score: {finalCoins} coins</h3>
            <button onClick={onPlayAgain}>Play again</button>
        </>
    )
}

export default ResultPhase