import React,{ useEffect, useState } from 'react';
import axios from "axios";
import './AccountRecovery.css';
import { useTheme } from './Theme';
import SearchBar from './SearchBar'; 


const AccountRecovery = () => {
    const [username, setUsername] = useState("");
    const [otp, setOTP] = useState("");
    const [npassword, setNPassword] = useState("");
    const [cpassword, setCPassword] = useState("");
    const [errors, setErrors] = useState({});
    const {darkMode, toggleTheme} = useTheme();

    const errorStyles = {
        color: 'maroon',
        fontSize: '12px',
      };

      useEffect(() => {
        document.title = "Account Recovery";
      }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append("username", username);
            formData.append("otp", otp);
            formData.append("npassword", npassword);
            formData.append("cpassword", cpassword);

            const response = await axios.post(
                "/CSE442-542/2023-Fall/cse-442m/backend/reset-user-password.php",
                formData,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            const responseData = response.data;

            // handle php responses
            if (responseData.message === "Success") {
                window.location.href = "https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/login";
            } else if (responseData.message === "Failed to update password") {
                //alert("There was a problem connecting to the server. Please try again later.");
                setErrors({ server: 'There was a problem connecting to the server. Please try again later.' });
            } else if (responseData.message === "Provided passwords do not match") {
                //alert("The provided passwords do not match");
                setErrors({ password: 'The provided passwords do not match' });
            } else if (responseData.message === "Invalid OTP") {
                //alert("The provided one-time code is invalid");
                setErrors({ otp: 'The provided one-time code is invalid.' });
            } else if (responseData.message === "Invalid username") {
                //alert("The provided username does not match any account in our records");
                setErrors({ username: 'The provided username does not match any account in our records' });
            } else {
                //alert("An error occurred. Please try again later.");
                setErrors({ generic: 'An error occurred. Please try again later.' });
            }
        } catch (error) {
            //console.error("Error:", error);
            setErrors({ generic: 'An error occurred. Please try again later.' });
        }
    }

    return (
        <div className = "AccountRecovery"> 
             <div className = "navbar">
                <ul> 
                    <li><a href="https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/login">Login</a></li>
                    <li><a href="https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/register">Register</a></li>
                    <button className="navbar-toggle"onClick={toggleTheme}>
                        {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    </button>
                </ul>
                <SearchBar />
            </div>
            <h1 className="title">An Authentication Code was Sent to Your Email</h1>
            <div className= "errors">
            {errors.username && <div style={errorStyles} className="error">{errors.username}</div>}
            {errors.otp && <div style={errorStyles} className="error">{errors.otp}</div>}
            {errors.password && <div style={errorStyles} className="error">{errors.password}</div>}
            {errors.generic && <div style={errorStyles} className="error">{errors.generic}</div>}
            </div>
            <div className = "fields">
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="username"
                        id="inputuser"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        name="otp"
                        id="inputotp"
                        placeholder="One-Time Code"
                        value={otp}
                        onChange={(e) => setOTP(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        name="npassword"
                        id="inputnpassword"
                        placeholder="New Password"
                        value={npassword}
                        onChange={(e) => setNPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        name="cpassword"
                        id="inputcpassword"
                        placeholder="Confirm New Password"
                        value={cpassword}
                        onChange={(e) => setCPassword(e.target.value)}
                        required
                    />
                    <button className = "submit-button" type = "submit">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    ); 
};

export default AccountRecovery
