import {useState} from "react"
import {CoinIcon} from "./Icons.jsx";

function ExecutionPhase({steps, onDone}) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0)

    const currentStep = steps[currentStepIndex]
    const isLastStep = currentStepIndex === steps.length - 1

    const handleNext = () => {
        if (isLastStep) {
            onDone()
        } else {
            setCurrentStepIndex(currentStepIndex + 1)
        }
    }

    return (
        <div className="execution-page-bg">
            <div className="execution-layout">
                <div className="card-surface execution-journey">
                    <h4>Your journey</h4>
                    {steps.map((step, index) => (
                        <p
                            key={step.connection_id}
                            className={index === currentStepIndex ? 'journey-step active' : 'journey-step'}
                        >
                            {step.from_station} — {step.to_station}
                        </p>
                    ))}
                </div>

                <div className="card-surface execution-detail">
                    <span className="badge-pill">Step {currentStepIndex + 1} / {steps.length}</span>
                    <h3>{currentStep.from_station} → {currentStep.to_station}</h3>
                    <p className="event-description">{currentStep.event_description}</p>
                    <p className={currentStep.event_effect >= 0 ? 'event-effect positive' : 'event-effect negative'}>
                        {currentStep.event_effect >= 0 ? '+' : ''}{currentStep.event_effect} <CoinIcon size={20}/>
                    </p>
                    <p className="coin-total">Coins: {currentStep.coins_after} <CoinIcon/></p>
                    <button className="btn-gold" onClick={handleNext}>
                        {isLastStep ? 'Finish' : 'Next step'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ExecutionPhase