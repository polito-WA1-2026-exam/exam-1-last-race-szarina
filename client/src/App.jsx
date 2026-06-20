import 'bootstrap/dist/css/bootstrap.min.css'

import { useContext, useState, useEffect } from 'react'
import { Container } from 'react-bootstrap'
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router'

import UserContext from './contexts/UserContext.js'
import { checkSession } from './api/auth.js'
import {LoginForm, Logout}  from './components/LoginForm.jsx'
import GameController from "./components/GameController.jsx";
import RankingPage from "./components/RankingPage.jsx";

function App() {
    const navigate = useNavigate()

    const [user, setUser] = useState({ id: undefined, username: undefined })

    useEffect(() => {
        checkSession().then(result => {
            if (result) {
                setUser({ id: result.id, username: result.username })
            }
        })
    }, [])

    const doLoginSuccess = (loggedInUser) => {
        setUser({ id: loggedInUser.id, username: loggedInUser.username })
        navigate('/home')
    }

    const doLogoutSuccess = () => {
        setUser({ id: undefined, username: undefined })
        navigate('/')
    }

    return (
        <UserContext.Provider value={user}>
            <Container>
                <Routes>
                    <Route path='/' element={<MainLayout />}>
                        <Route index element={<LandingView />} />
                        <Route path='login' element={<LoginView doLoginSuccess={doLoginSuccess} />} />
                        <Route path='home' element={<HomeView doLogoutSuccess={doLogoutSuccess} />} />
                        <Route path='logout' element={<Logout doLogoutSuccess={doLogoutSuccess} />} />
                        <Route path='game' element={<GameView />} />
                        <Route path='ranking' element={<RankingView />} />
                    </Route>
                </Routes>
            </Container>
        </UserContext.Provider>
    )
}

function MainLayout() {
    return <>
        <Outlet />
    </>
}

function LandingView() {
    const user = useContext(UserContext)
    if (user.id) return <Navigate to='/home' />
    return <h1>Landing page placeholder</h1>
}

function LoginView(props) {
    const user = useContext(UserContext)
    if (user.id) return <Navigate to='/home' />
    return <LoginForm doLoginSuccess={props.doLoginSuccess} />
}

function HomeView(props) {
    const user = useContext(UserContext)
    const navigate = useNavigate()
    if (!user.id) return <Navigate to='/' />

    return (
        <>
            <h1>Welcome, {user.username}</h1>
            <button onClick={() => navigate('/ranking')}>Ranking</button>
            <button onClick={() => navigate('/game')}>Play</button>
        </>
    )
}

function GameView() {
    const user = useContext(UserContext)
    if (!user.id) return <Navigate to='/' />
    return <GameController />
}

function RankingView() {
    const user = useContext(UserContext)
    if (!user.id) return <Navigate to='/' />
    return <RankingPage/>
}

export default App