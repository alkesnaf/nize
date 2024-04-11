import React, { useState } from 'react';
import axios from "axios";
import './SearchBar.css';

const SearchBar = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([false]);
    const [showSearchResults, setShowSearchResults] = useState(false);


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


    return (
        <form className="searchb" onClick={(e) => e.preventDefault()}>
            <input className="searchb" type="search" id="searchInput" placeholder="Discover Users" value={searchQuery} onChange={handleSearchOnChange}/>
        {/* Optionally display search results here */}
        </form>
    );
};

export default SearchBar;
