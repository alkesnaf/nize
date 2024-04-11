import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { useTheme } from './Theme';
import SearchBar from './SearchBar';

export default function Dashboard() {
    const [username, setUsername] = useState();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const {darkMode, toggleTheme} = useTheme();

    const [link, setLink] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Dashboard";
        fetchData();
    }, []);
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


    const fetchData = async () => {
        const authToken = getCookie("authtoken");
        if (!authToken) {
            navigate('/login');
        } else {
            const formData = new FormData();
            formData.append("authtoken", authToken);

            try {
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
                    setUsername(responseData.username);
                } else {
                    navigate("/login");
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }
    };

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

    const handleLogout = () => {
        document.cookie = `authtoken=; Max-Age=0; Secure; Path=/CSE442-542/2023-Fall/cse-442m/`;
        window.location.href = "https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/login";
    };

    const handleSearchOnChange = (e) => {
        const input = e.target.value;
        setSearchQuery(input);

        if (input.trim() !== "") {
            performSearch(input);
            setShowSearchResults(true);
        } else {
            setSearchResults([]);
            setShowSearchResults(false);
        }
    };

    const performSearch = async (query) => {
        const formDataS = new FormData();
        formDataS.append("user", query);

        try {
            const response = await axios.post(
                "https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/search-user.php",
                formDataS,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            const searchData = response.data;
            setSearchResults(searchData);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleSearchOnClick = () => {
        setShowSearchResults(true);
    };

    const handleDocumentClick = (e) => {
        const searchInput = document.getElementById('searchInput');
        if (searchInput && !searchInput.contains(e.target)) {
            setShowSearchResults(false);
        }
    };

    useEffect(() => {
        document.title = "Dashboard";
        fetchData();
        document.addEventListener('click', handleDocumentClick);

        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, []);

    const redirectToProfile = (username, event) => {
        event.preventDefault();
        navigate(`/discover/${username}`);
    };

    getPFP(username);
    return (
        <div className="Dashboard">
            <div className="navbar">
                <img className = "pfp-nav" src={link}></img>
                {username && <p className="usernameDisplay">WELCOME BACK {username.toUpperCase()}</p>}    
                <form className="searchb" onClick={handleSearchOnClick}>
                    <input className="searchb" type="search" id="searchInput" placeholder="Discover Users" value={searchQuery} onChange={handleSearchOnChange}/>
                </form>
                <ul>
                    <li><a href="/CSE442-542/2023-Fall/cse-442m/profile">Profile</a></li>
                    <li><a href="#logout" onClick={handleLogout}>Logout</a></li>
                    <button className="navbar-toggle"onClick={toggleTheme}>
                        {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    </button>
                    <li><a href="/CSE442-542/2023-Fall/cse-442m/aboutus">About US</a></li>
                </ul>
            </div>
            <div className="placebuttons">
                <h2 className="title">Stay on top of things with Nize!</h2>
                <a href="/CSE442-542/2023-Fall/cse-442m/todo">
                    <button className="Dash-Button">To-Do</button>
                </a>
                <a href="/CSE442-542/2023-Fall/cse-442m/calendar">
                    <button className="Dash-Button">Calendar</button>
                </a>
                <a href="/CSE442-542/2023-Fall/cse-442m/fileupload">
                    <button className="Dash-Button">Files</button>
                </a>
            </div>
            <div className="searchResultsContainer" style={{ display: showSearchResults ? 'block' : 'none' }}>
                <div className="searchResults">
                    {searchQuery.length > 0 ? (
                        Array.isArray(searchResults) && searchResults.length > 0 ? (
                            searchResults.map((user, index) => (
                                <div className="searchResult" key={index}>
                                    <a href={`#`} onClick={(event) => redirectToProfile(user.username, event)}>
                                        <p>{user.username}</p>
                                    </a>
                                </div>
                            ))
                        ) : (
                            <p>No search results found</p>
                        )
                    ) : null}
                </div>
            </div>
        </div>
    );
}
