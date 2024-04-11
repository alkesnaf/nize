import React, { useEffect } from "react";
import './Home.css'
import axios from "axios";
import {useNavigate, Link} from 'react-router-dom';
import {useTheme} from './Theme';

const Home = () => {
    const navigate = useNavigate();
    const {darkMode, toggleTheme} = useTheme();
    useEffect(() => {
        document.title = "Nize - Home";
      }, []);

    useEffect(() => {
        // Check for the "authtoken" cookie
        const authToken = getCookie("authtoken");
    
        async function fetchData() {
            const formData = new FormData();
            formData.append("authtoken", authToken);

            try {
                // Make an API call to verify the auth token
                const response = await axios.post(
                    "https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/check-auth.php",
                    formData,
                    {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                    }
                );

            const responseData = response.data;

            if (responseData.message === "Token valid") {
                // Token is valid, redirect to dashboard
                navigate("/dashboard");
            }
            } catch (error) {
                console.error("Error:", error);
            }
        }

        // if there is an auth token, determine if it is valid
        if (authToken){
            fetchData();
        }
    }, []);

    // Function to retrieve a cookie by name
    function getCookie(name) {
        const cookies = document.cookie.split("; ");
        for (const cookie of cookies) {
            const [cookieName, cookieValue] = cookie.split("=");
            if (cookieName === name) {
                return decodeURIComponent(cookieValue);
            }
        }
        return null;
    }

    return(
        <div className = "Home">
            <body className = "banner">
                <div className= "navbar">
                    <ul>
                        <div class="logo">Nize</div>
                        <li><a href="https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/login">Login</a></li>
                        <button className="navbar-toggle"onClick={toggleTheme}>
                            {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        </button>
                    </ul>
                </div>
                    <section class="hero">
                        <div class="hero-content">
                            <h1>Stay Organized with Nize!</h1>
                            <h4>Effortlessly manage your schedule, events, and tasks.</h4>
                            <h4>Get started today and take control of your schedule!</h4>
                        </div>
                        <a href="https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/register" class="cta-button">Register Now</a>
                    </section>
                    <section class="features" id="features">
                        <h2>Features</h2>
                        <div class="feature">
                            <h3>Event Scheduling</h3>
                            <p>Effortlessly schedule events, meetings, and appointments.</p>
                        </div>
                        <div class="feature">
                            <h3>Task Management</h3>
                            <p>Create and manage tasks with due dates and priorities.</p>
                        </div>
                        <div class="feature">
                            <h3>Reminders</h3>
                            <p>Receive timely notifications and reminders for your events and tasks.</p>
                        </div>
                    </section>
                    <p>&copy; 2023 Nize</p>
            </body>
        </div>
    );
}

export default Home;
