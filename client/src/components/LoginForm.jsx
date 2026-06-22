import {useEffect, useState} from "react"
import {doLogin, doLogout} from "../api/auth"
import {Form} from "react-bootstrap"


function LoginForm(props) {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errormsg, setErrormsg] = useState('')

    const doSubmit = async (ev) => {
        ev.preventDefault()
        setErrormsg('')

        if (!username.trim() || !password.trim()) {
            setErrormsg('Please enter both username and password.')
            setTimeout(() => setErrormsg(''), 3000)
            return
        }

        try {
            const user = await doLogin(username, password)
            props.doLoginSuccess(user)
        } catch (ex) {
            setErrormsg(ex.message)
            setTimeout(() => setErrormsg(''), 3000)
        }
    }

    return (
        <div className="page-bg login-page-bg">
            <div className="card-surface login-card">
                <img src="/ornament.png" alt="" className="landing-ornament"/>
                <h2>Please login</h2>

                <Form onSubmit={doSubmit}>
                    <Form.Group className="mb-3" controlId="formUsername">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="text" placeholder="Enter username" value={username}
                                      onChange={(ev) => setUsername(ev.target.value)}/>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" value={password}
                                      onChange={(ev) => setPassword(ev.target.value)}/>
                    </Form.Group>
                    <button className="btn-gold" type="submit">
                        Log in
                    </button>
                    {errormsg && <div className="login-error">{errormsg}</div>}
                </Form>
            </div>
        </div>
    )
}

function Logout(props) {
    useEffect(() => {
        doLogout().then(() => {
            props.doLogoutSuccess()
        })
    }, [])
    return "Logging out..."
}


export {LoginForm, Logout};