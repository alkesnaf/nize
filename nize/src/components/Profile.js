import React, { useState, useEffect } from "react";
import "./Profile.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from './Theme';
import SearchBar from './SearchBar';

const Profile = () => {
    const [username, setUsername] = useState(null);
    const [loggedIn, setLoggedIn] = useState(null);
    const [friends, setFriends] = useState(null);
    const {darkMode, toggleTheme} = useTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Profile"
        const authToken = getCookie("authtoken");

        async function checkAuth() {
            const authpath = "https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/check-auth.php"
            const URLParams = new URLSearchParams();
            URLParams.append("authtoken", authToken);

            try {
                const response = await axios.post(authpath, URLParams.toString());
                const responseData = response.data;
                if (responseData.message === "Token valid") {
                    setUsername(responseData.username);
                    setLoggedIn(true);
                } else {
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }

        if (!!authToken) {
            checkAuth();
        } else {
            setLoggedIn(false);
        }
    }, []);

    useEffect(() => {
        async function fetchFriends() {
            const friendspath = "https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/friends/get-friends.php";
            const URLParams = new URLSearchParams();
            URLParams.append("authtoken", getCookie("authtoken"));

            try {
                const response = await axios.post(friendspath, URLParams.toString());
                const responseData = response.data;
                if (responseData.message === "success") {
                    setFriends(responseData.friends)
                } else if (responseData.message === "none") {
                    setFriends([]);
                } else {
                    setFriends(null);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }

        if (loggedIn === true) {
            fetchFriends();
        } else if (loggedIn === false) {
            navigate("/login");
        }
    }, [loggedIn]);

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

    function renderFriends() {
        if (!friends) {
            return (
                <div className="Profile-friendslistelement">
                    <h2 id="Profile-friendstext">An Error Occurred</h2>
                </div>
            );
        } else if (friends.length === 0) {
            return (
                <div className="Profile-friendslistelement">
                    <h2 id="Profile-friendstext">No Friends Yet</h2>
                </div>
            );
        } else {
            return (
                <div>
                    {friends.map((friend) => (
                        <div className="Profile-friendslistelement">
                            <Link key={friend} to={`/discover/${friend}`}>
                                <h2 id="Profile-friendstext">{friend}</h2>
                            </Link>
                        </div>
                    ))}
                </div>
            );
        }
    }

    const handleSearchOnClick = () => {
        setShowSearchResults(true);
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

    const redirectToProfile = (username, event) => {
        event.preventDefault();
        navigate(`/discover/${username}`);
    };

    return (
        <div className="Profile">
            <div className="Profile-navbar">
                <form className="searchb" onClick={handleSearchOnClick}>
                    <input className="searchbar" type="search" id="searchInput" placeholder="Discover Users" value={searchQuery} onChange={handleSearchOnChange}/>
                </form>
                <ul>
                    <li><a href="/CSE442-542/2023-Fall/cse-442m/dashboard">Home</a></li>
                    <li><a href="#logout" onClick={handleLogout}>Logout</a></li>
                    <button className="navbar-toggle"onClick={toggleTheme}>
                        {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    </button>
                </ul>
            </div>
            
            <h1 className="Profile-title">{username}</h1>

            <div className="Profile-friendslist">
                <h3 id="Profile-friendstext">Friends List</h3>
                {renderFriends()}
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

export default Profile;
