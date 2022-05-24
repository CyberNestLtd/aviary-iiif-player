import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ service, setAuth, skipAuth }) => {

    // console.log(service);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [failureMsg, setFailureMsg] = useState("");

    const setEmailValue = (e) => { setUsername(e.target.value) }
    const setPassowrdValue = (e) => { setPassword(e.target.value) }

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(service['@id'], {
            email: username,
            password: password
        })
            .then(function (response) {
                setAuth({
                    'access-token': response.headers['access-token'],
                    'client': response.headers['client'],
                    'uid': response.headers['uid']
                });
            })
            .catch(function (error) {
                var msg = service.failureDescription ? service.failureDescription : 'Invalid email or password.'
                setFailureMsg(msg);
                console.log("rimi", error);
            });
        console.log("Asdasdasd")
    }

    const handleSkip = (e) => {
        e.preventDefault();
        skipAuth(true);
    }

    return (
        <div>
            <h2>{(service.header) ? service.header : 'Please Login'}</h2>
            <p>{(service.description) ? service.description : ''}</p>
            <span class>{failureMsg}</span>
            <form>
                <input value={username} onChange={setEmailValue} type="text" placeholder="Enter email" className="px-4 pt-4 pb-4 border w-full rounded-md" />
                <input value={password} onChange={setPassowrdValue} type="password" placeholder="password" className="px-4 pt-4 pb-4 border w-full rounded-md" />
                <button onClick={handleSkip}>Skip</button>
                <button onClick={handleSubmit}>{(service.confirmLabel) ? service.confirmLabel : 'Login'}</button>
            </form>
        </div>

    )
}

export default Login;