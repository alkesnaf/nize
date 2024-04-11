import "./Login.css";
import React, { useEffect, useState } from "react";
import {useNavigate} from 'react-router-dom';
import axios from "axios";
import { useTheme } from './Theme';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const {darkMode, toggleTheme} = useTheme();
    const errorStyles = {
        color: 'maroon',
        fontSize: '12px',
      };
    
    const textColor = darkMode ? 'white' : 'black'; // Define colors for light and dark modes

    const forgotPasswordLinkStyle = {
        color: textColor,
    };

    useEffect(() => {
        document.title = "Login";
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append("username", username);
            formData.append("password", password);

            const response = await axios.post(
                "https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/verify-credentials.php",
                formData,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            const responseData = response.data;
            // handle php response
            if (responseData.message === "Login successful") {
                // set the auth token as a cookie and redirect to the dashboard
                //take out secure when testing locally sometimes it will not work 
                document.cookie = `authtoken=${responseData.authtoken}; Max-Age=86400; path=/CSE442-542/2023-Fall/cse-442m/`;
                navigate(`/dashboard`);
            } else if (responseData.message === "No username") {
                // alert the user - they have provided a username that is invalid
                setErrors({ username: 'Incorrect username or password. Please try again.' });
                //alert("Invalid username. Please try again.");
            } else if (responseData.message === "Bad password") {
                // alert the user - they have provided a password that does not match the password saved in the database
                setErrors({ password: 'Incorrect username or password. Please try again.' });
                //alert("Incorrect password. Please try again.");
            } else {
                // catch all for any errors, ex. database is temporarily down
                setErrors({general: 'An error occurred. Please try again later.'});
                //alert("An error occurred. Please try again later.");
            }
        } catch (error) {
            console.error("Error:", error);
            //alert("Something went wrong. Please try again later.");
            setErrors({general: 'An error occurred. Please try again later.'});
        }
    }

    return(
        <div className="Login">
            
            <div className = "navbar">
                <ul>
                    <button className="navbar-toggle"onClick={toggleTheme}>
                        {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    </button>
                    <li><a href="/CSE442-542/2023-Fall/cse-442m/register">Register</a></li>
                </ul>
                <ul>
                    <li><a href="/CSE442-542/2023-Fall/cse-442m/aboutus">About Us</a></li>
                </ul>
            </div>

            <h1 className="title">Nize</h1>
            <div className = "errors">
                {errors.username && <div style={errorStyles} className="error">{errors.username}</div>}
                {errors.password && <div style={errorStyles} className="error">{errors.password}</div>}
                {errors.general && <div style={errorStyles} className="error">{errors.general}</div>}
            </div>
            <div className="fields">
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text"
                        name="username"
                        placeholder="Username"
                        id="inputusername"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required 
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        id="inputpassword"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                    />
                    
                    <button className="login-button" type="submit">
                        Login
                    </button>
                </form>
                <div className="forgot-password-link">
                    <a href="https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/password" id="fplink" style={forgotPasswordLinkStyle}>
                        Forgot Password?
                    </a>
                </div>
            </div>
        </div>
    );
}
export default Login;
