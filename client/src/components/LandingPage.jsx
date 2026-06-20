import {useState} from "react";
import {Button, Container} from "react-bootstrap";
import InstructionsText from "./InstructionsText.jsx";

function LandingPage({onGoToLogin}){
    const [showInstructions, setShowInstructions] = useState(false)

    return(
        <Container>
            <h1>Last Race</h1>
            <Button onClick={onGoToLogin}>Login</Button>
            <Button onClick={()=> setShowInstructions(!showInstructions)}>
                {showInstructions? 'Hide instructions':'How to play'}
            </Button>

        {showInstructions &&  <InstructionsText />}
        </Container>

    )
}

export default LandingPage