import React, { useState, useEffect } from "react";
import "./Discover.css";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from './Theme';
import SearchBar from './SearchBar'; 

export default function Discover(){
    const navigate = useNavigate();
    // stores username provided in browser path
    const { username } = useParams();
    // boolean state whether the request comes from a user with an authtoken
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    // username of the user requesting content
    const [actualUser, setActualUser] = useState(null);
    // boolean state whether the requested page corresponds to a real user
    const [validUser, setValidUser] = useState(null);
    // friendship status of the users (if applicable)
    const [friendStatus, setFriendStatus] = useState(null);
    const [link, setLink] = useState(null);
    const {darkMode, toggleTheme} = useTheme();

      const getPFP = async (username) => {
            const response = await axios.get('https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/get_pfp.php', 
                {
                    params: {username: username},
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
                )
                .then(response =>{
                    console.log("In pfp");
                    setLink(response.data);
                } )
                .catch(error => { /*alert("ON MY MOMMA");*/
            
            });
        };

   
    useEffect(() => {
        document.title = username;
        // Check for the "authtoken" cookie
        const authToken = getCookie("authtoken");
        const istoken = !!authToken;

        // fetchData takes an auth token and returns a json message
        // for a correct auth token, response takes form [message => Token valid, username => {UESRNAME}]
        async function fetchData() {
            const formData = new URLSearchParams();
            formData.append("authtoken", authToken);

            try {
                // Make an API call to verify the auth token
                const response = await axios.post(
                    "https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/check-auth.php",
                    formData.toString(),
                    {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                    }
                );
                const responseData = response.data;

                if (responseData.message === "Token valid") {
                    setActualUser(responseData.username);
                    setIsLoggedIn(true);
                } else {
                    // otherwise they arent logged in with valid credentials
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }

        // determine who this user is if they are logged in
        if (istoken) {
            fetchData();
        } else {
            setIsLoggedIn(false);
        }

        async function checkUser() {
            const formData = new URLSearchParams();
            formData.append("username", username);

            try {
                // make an API call verify this is an actual user page
                const response = await axios.post(
                    "https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/is-user.php",
                    formData.toString(),
                    {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                    }
                );

                const responseData = response.data;

                if (responseData.message === "true") {
                    setValidUser(true);
                } else {
                    setValidUser(false);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }

        checkUser();

    }, []);

    // This useEffect will run whenever isLoggedIn or validUser changes
    useEffect(() => {
        // If both are true, we will need the friendship status of the user
        if (isLoggedIn && validUser) {
            async function fetchStatus() {
                const formData = new URLSearchParams();
                formData.append("username1", actualUser);
                formData.append("username2", username);
                formData.append("authtoken", getCookie("authtoken"));
                try {
                    const response = await axios.post(
                        "https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/friends/get-friendship-status.php",
                        formData.toString(),
                        {
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                            },
                        }
                    );

                    const responseData = response.data;

                    if (responseData.message === "success") {
                        setFriendStatus(responseData.status);
                    } else {
                        setFriendStatus("-2");
                    }
                } catch (error) {
                    console.error("Error:", error);
                }
            }

            if (actualUser === username){
                return;
            } else {
                fetchStatus();
            }
        }
    }, [isLoggedIn, validUser]);

    useEffect(() => {
        // This useEffect will run whenever actualUser changes
        if (actualUser === username) {
          navigate("/profile");
        }
      }, [actualUser, username]);

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

    function handleLogout() {
        document.cookie = `authtoken=; Max-Age=0; Secure; Path=/CSE442-542/2023-Fall/cse-442m/`;
        navigate("/login");
    }

    function update_status(status) {
        if (status !== "1" && status !== "2") {
            console.error("Invalid status. It must be a 1 or a 2");
            return;
        }
        const phpURL = "https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/friends/update-friend-status.php";

        const data = new URLSearchParams();
        data.append("authtoken", getCookie("authtoken"));
        data.append("username", username);
        data.append("status", status);

        axios.post(phpURL, data)
            .then(response => {
                console.log('Server response:', response.data);
                window.location.reload();
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    function remove_friend() {
        const phpURL = "https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/friends/remove-friend.php";
        const data = new URLSearchParams();
        data.append("authtoken", getCookie("authtoken"));
        data.append("username", username);

        axios.post(phpURL, data)
            .then(response => {
                console.log('Server response:', response.data);
                window.location.reload();
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }

    function block_user(action) {
        const phpURL = 'https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/friends/block-user.php';
        const data = new URLSearchParams();
        data.append('authtoken', getCookie("authtoken"));
        data.append('username', username);
        data.append('action', action);

        axios.post(phpURL, data)
            .then(response => {
                console.log('Server reponse', response.data);
                window.location.reload();
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }

    // function is responsible for dynamic content rendering depending on the state of the current user
    const renderContent = () => {
        // this is not a logged in user
        if (!isLoggedIn){
            return renderNotLoggedIn();
        } else {
            return renderLoggedIn();
        }
    };

    const renderNotLoggedIn = () => {
        if (validUser){
            // valid user page was requested but we are not logged in
            return (
                <div className = "Discover">
                    <div className = "navbar">
                        <ul>
                            <li><a href="/CSE442-542/2023-Fall/cse-442m/login">Login</a></li>
                            <li><a href="/CSE442-542/2023-Fall/cse-442m/register">Register</a></li>
                        </ul>
                    </div>

                    <h1 className="title">{username}</h1>

                    <p className ="checklabel">Login to access this user's information</p>
                    <a href="/CSE442-542/2023-Fall/cse-442m/login" id='discoverlink'>
                        <button className="discover-button" id='fplink'>Login</button>
                    </a>
                </div>
            );
        } else {
            // invalid user page was requested and we are not logged in
            return (
                <div className = "Discover">
                    <div className = "navbar">
                        <ul>
                            <li><a href="/CSE442-542/2023-Fall/cse-442m/login">Login</a></li>
                            <li><a href="/CSE442-542/2023-Fall/cse-442m/register">Register</a></li>
                            <button className="navbar-toggle"onClick={toggleTheme}>
                                {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            </button>
                        </ul>
                    </div>

                    <h1 className="title">The requested user does not exist</h1>
                </div>
            );
        }
    };

    

    // TODO need to add the onclick once backend is ready
    const friendshipButton = () => {
        getPFP(username);

        if (friendStatus == "-1"){
            return (
                <div>
                    <p className="checklabel">Only friends of {username} can view their account information</p>
                    <button className="discover-button" id='statusButton1' onClick={() => update_status("1")}>Add Friend</button>
                </div>
            );
        } else if (friendStatus == "0"){
            return (
                <div>
                    <p className ="checklabel">A friend request with {username} is pending</p>
                    <button className="discover-button" id='statusButton2' onClick={() => remove_friend()}>Cancel</button>
                </div>
            );
        } else if (friendStatus == "1") {
            return (
                <div>
                    <p className ="checklabel">{username} would like to be friends</p>
                    <div className="fresponsebar">
                        <ul>
                            <li>
                                <button className="discover-button" id='statusButton3' onClick={() => update_status("2")}>Accept</button>
                            </li>
                            <li>
                                <button className="discover-button" id='statusButton4' onClick={() => remove_friend()}>Deny</button>
                            </li>
                        </ul>
                    </div>
                </div>
            );
        } else if (friendStatus == "2") {
            return (
                <div className = "imgcontainer">
                    <img className = "pfp" src={link}></img>
                    <p className ="checklabel">You are currently friends with {username}!</p>
                    <button className="discover-button" id='fplink'>Calendar</button>
                </div>
            );
        } 
        else if (friendStatus == "3"){
            return(
                <div>
                    <p className="checklabel">You have blocked {username}!</p>
                </div>
            )
        }else if(friendStatus == "4"){
                return(
                    <div>
                        <p className="checklabel">You have been blocked by {username}</p>
                    </div>
                )
        } else {
            return (
                <p className ="checklabel">An error occured, please try again later</p>
            );
        }
    }

    const blockButton = () => {
        if (friendStatus == "3") {
            return (
                <button className="discover-button" id="statusButton5" onClick={() => block_user("unblock")}>Unblock user</button>
            );
        }
        else{
            return(
                <button className="discover-button" id="statusButton6" onClick={() => block_user("block")}>Block user</button>
            );
        }
    }

    const renderLoggedIn = () => {
        if (validUser) {
            // we are logged in and this is a valid user, need to get current friend status and render page
            return (
                <div className = "Discover">
                    <div className = "navbar">
                        <ul>
                            <li><a href="/CSE442-542/2023-Fall/cse-442m/dashboard">Dashboard</a></li>
                            <li><a href="#logout" onClick={handleLogout}>Logout</a></li>
                            <button className="navbar-toggle"onClick={toggleTheme}>
                                {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            </button>
                        </ul>
                    </div>

                    <h1 className="title">{username}</h1>

                    {friendshipButton()}
                    <br></br>
                    {blockButton()}
                </div>
            );
        } else {
            // we are logged in but this is not a valid user page
            return (
                <div className = "Discover">
                    <div className = "navbar">
                        <ul>
                            <li><a href="/CSE442-542/2023-Fall/cse-442m/dashboard">Dashboard</a></li>
                            <li><a href="#logout" onClick={handleLogout}>Logout</a></li>
                        </ul>
                        <SearchBar />
                    </div>

                    <h1 className="title">The requested user does not exist</h1>
                </div>
            );
        }
    };

    return renderContent();
}
