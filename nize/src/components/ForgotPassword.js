import React,{ useEffect, useState } from 'react';
import axios from "axios";
import './ForgotPassword.css';
import { useTheme } from './Theme';
import SearchBar from './SearchBar';

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState({});
    const {darkMode, toggleTheme} = useTheme();
    const errorStyles = {
        color: 'maroon',
        fontSize: '12px',
      };

      useEffect(() => {
        document.title = "Forgot Password";
      }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try{
            const formData = new FormData();
            formData.append("email", email);

            const response = await axios.post(
                "/CSE442-542/2023-Fall/cse-442m/backend/reset-password-otp.php",
                formData,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            const responseData = response.data;

            // handle php responses
            if (responseData.message === "email sent") {
                window.location.href = "https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/recover";
            } else if (responseData.message === "invalid email") {
                //alert("Provided email is not associated with a user account");
                setErrors({ email: 'Provided email is not associated with a user account.' });
            } else if (responseData.message === "not an email") {
                //alert("Please provide a valid email address");
                setErrors({ email: 'Please provide a valid email address.' });
            } else if (responseData.message === "no email givent") {
                //alert("No email provided");
                setErrors({ email: 'No email provided' });
            } else {
                //alert("An error occurred. Please try again later.");
                setErrors({ general: 'An error occurred. Please try again later.' });
            }
        } catch (error) {
            console.error("Error:", error);
            setErrors({ general: 'An error occurred. Please try again later.' });
        }
    }

    return (
        <div className = "ForgotPassword"> 
            <div className = "background">
                <div className = "navbar">
                    <ul>
                        <li><a href="https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/login">Login</a></li>
                        <li><a href="https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/register">Register</a></li>
                        <button className="navbar-toggle"onClick={toggleTheme}>
                            {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        </button>
                    </ul>
                   < SearchBar />
                </div>
                <h1 className="title">Forgot Password</h1>
                <p className ="usernameLabel">Enter your email address below to reset password</p>
                <div className="errors">
                    {errors.email && <div style={errorStyles} className="error">{errors.email}</div>}
                    {errors.general && <div style={errorStyles} className="error">{errors.general}</div>}
                </div>
                <div className="fields">
                    <form onSubmit={handleSubmit}>
                        <input type = "text" name="username" id = "inputemail" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                        <button className = "submit-button" type = "submit">Submit</button>
                     </form>
                </div>
            </div>
        </div>
    ); 
};

export default ForgotPassword;
