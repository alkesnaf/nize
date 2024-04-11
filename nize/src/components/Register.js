import React,{useState, useEffect} from 'react';
import './Register.css'
import axios from 'axios';
import { useTheme } from './Theme';

const Register = () => {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");
    const [errors, setErrors] = useState({});
    const [selectedPFP, setSelectedPFP] = useState(null);
    const {darkMode, toggleTheme} = useTheme();
    const errorStyles = {
        color: 'maroon',
        fontSize: '12px',
      };

      useEffect(() => {
        document.title = "Register";
      }, []);


    const handleUploadClick = (event) => {
        document.getElementById('fileInput').click();
    };

    const handleFileChange = (event) => {
        setSelectedPFP(event.target.files[0]);
        console.log(event.target.files[0]); // Log the selected file
    };

    const handleProfileUpload = (file) => {
        if (!file.file_content || !file.file_type) {
            return <p>Error: Incomplete file information</p>;
        }

        // Handle different file types appropriately
        let content;
        if (file.file_type.startsWith('image/')) {
            content = (
                <img
                    src={`data:${file.file_type};base64,${file.file_content}`}
                    alt={file.file_name}
                    style={{ maxWidth: '100%', maxHeight: '500px' }}
                />
            );
        } else {
            // Handle other file types as needed
            content = <p>Unsupported file type: {file.file_type}</p>;
        }

        return content;
    };

    const submitPressed = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append("username", username);
            formData.append("email", email);
            formData.append("password1", password1);
            formData.append("password2", password2);
            formData.append("profilePicture", selectedPFP);

            const response = await axios.post(
                "https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/register.php",
                formData,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            const responseData = response.data;
                // code to handle php
                if (responseData.message === 'Register successful') {
                    window.location.href ='https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/login';
                  } else if (responseData.message === 'an account with this username already exists') {
                    setErrors({ username: 'Username is already taken. Please try a different one.' });
                  } else if (responseData.message === 'an account with this email already exists') {
                    setErrors({ email: 'This email is already in use! Please provide a different email address' });
                  } else if (responseData.message === 'passwords do not match') {
                    setErrors({ password: 'Passwords do not match. Please try again' });
                  } else if (responseData.message === 'not a valid email') {
                    setErrors({ email: 'The email address provided is not a valid email. Please try again' });
                  } else if (responseData.message === 'something went wrong') {
                    setErrors({ general: 'An error occurred. Please try again later.' });
                  } else if (responseData.message === 'something went wrong with pfp'){
                    setErrors({ general: 'something went wrong with pfp.'});
                  } else if (responseData.message === 'something went wrong with pfp check'){
                    setErrors({ general: 'something went wrong with pfp check.'});
                  }
                } catch (error) {
                  console.error('Error:', error);
                  setErrors({ general: 'Something went wrong. Please try again later.' });

                }
      };


    return (
        <div class = "Register">
            <body>
                <div class = "background">
                    <div class = "navbar">
                        <ul>
                            <button className="navbar-toggle"onClick={toggleTheme}>
                                {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            </button>
                            <li><a href="/CSE442-542/2023-Fall/cse-442m/login">Login</a></li>
                        </ul>
                        <ul>
                            <li><a href="/CSE442-542/2023-Fall/cse-442m/aboutus">About US</a></li>
                        </ul>
                    </div>
                    <h1 className= "title">Sign Up now and stay organized!</h1>
                    <div className="errors">
                    {errors.general && <div style={errorStyles} className="error">{errors.general}</div>}
                    {errors.password && <div style={errorStyles} className="error">{errors.password}</div>}
                    {errors.email && <div style={errorStyles} className="error">{errors.email}</div>}
                    {errors.username && <div style={errorStyles} className="error">{errors.username}</div>}
                    </div>
                    <div class = "fields">
                        <form onSubmit={submitPressed}>
                            <input type = "username" id = "inputusername" name ="username" placeholder="Username" onChange={(e) => setUsername(e.target.value)} required></input>
                            <input type = "email" id = "inputemail" name = "email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required></input>
                            <input type = "password" id = "inputpassword1" name = "password1" placeholder="Password" onChange={(e) => setPassword1(e.target.value)} required></input>
                            <input type = "password" id = "inputpassword2" name = "password2" placeholder="Verify Password" onChange={(e) => setPassword2(e.target.value)} required></input>
                            <input type="file" id="fileInput" style={{ display: 'none' }} onChange={handleFileChange} />
                            <div className="menu-item menu-item-upload" onClick={handleUploadClick}>Upload</div>
                            <button className = "registerButton" type = "submit">Register</button><br></br>
                        </form>
                        <br></br>
                    </div>
                </div>
            </body>
        </div>
    );
}

export default Register;
