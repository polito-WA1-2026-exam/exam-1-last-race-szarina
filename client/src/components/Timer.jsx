import { useState, useEffect } from "react";

function Timer({seconds, onExpire}) {
    const [timeLeft, setTimeLeft] = useState(seconds);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onExpire();
                    return 0;
                }
                return prev - 1
            })
    }, 1000)
    return () => clearInterval(interval)
    }, [])
    return <h3>Time left: {timeLeft}s</h3>
}
export default Timer