import './Calendar.css'
import axios from 'axios'
import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths  } from 'date-fns';
import AddEventModal from './AddEventModal';
import EditEventModal from './EditEventModal';
import { useTheme } from './Theme';
import SearchBar from './SearchBar'; 
import { useNavigate } from 'react-router-dom';

const Calendar = () => {
  const today = new Date();
  const firstDayOfMonth = startOfMonth(today);
  const lastDayOfMonth = endOfMonth(today);
  //const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showMoreDay, setShowMoreDay] = useState(null);
  const [eventList, setEventList] = useState([]);
  const [sharedUser, setSharedUser] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [taskList, setTaskList] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const {darkMode, toggleTheme} = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navigate = useNavigate();
  
  const shareEvent = async () => {
    //console.log("Share to " + sharedUser + "event id" + selectedEvent.event_id );
    const authToken = getCookie("authtoken");
    const new_event_data = {
        authtoken: authToken, 
        shared_username: sharedUser, 
        event_id: selectedEvent.event_id
    }
    const response = await axios.post('https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/share-event.php', new_event_data)
        .then(response =>{
            //console.log(response.data);
        }).catch(error => { alert("ON MY MOMMA");});
 };
 

  const showEvents = async (date) => {
    const authToken = getCookie("authtoken");
    //console.log(authToken);
    if(!authToken){
        window.location.href = "https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/";
    }else{
        //console.log(document.user_id);
        const date_date = date.toISOString().slice(0,10);
        const response = await axios.get('https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/calendar.php', 
            {
                params: {user_id: document.user_id, date: date_date, authtoken: authToken},
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
            )
            .then(response =>{
                //console.log(response);
                let toBeAdded = [];
                for(let s of response.data){
                    toBeAdded.push(JSON.parse(s));
                }
                setEvents(prev => ({ ...prev, [date_date]: toBeAdded}));
                setEventList(toBeAdded);
                //console.log(toBeAdded);
            } )
            .catch(error => { /*alert("ON MY MOMMA");*/
        
        });
    }
    };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const handlePrevMonth = () => {
        setCurrentMonth(prev => subMonths(prev, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(prev => addMonths(prev, 1));
    };

    useEffect(() => {
        const firstDayOfMonth = startOfMonth(currentMonth);
        const lastDayOfMonth = endOfMonth(currentMonth);
        const newDaysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
        for(const day of newDaysInMonth){
            showEvents(day);
        }
        setDaysInMonth(newDaysInMonth);
    }, [currentMonth]);

    const handleOpenEditModal = () => {
        setIsEditModalOpen(true);
    }
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    }

    const handleOpenModal = () => {
        setIsModalOpen(true);
      };

    const handleCloseModal = () => {
      setIsModalOpen(false); 

    };

    const handleSharedUserChange = (e) => {
        setSharedUser(e.target.value);
    };

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

    const deleteEvent = async () => {
        const authToken = getCookie("authtoken");
        const delete_event_data = {
            authtoken: authToken,
            event_id: selectedEvent.event_id
        }
        const response = await axios.post('https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/delete-calendar-event.php', delete_event_data)
            .then(response => {window.location.reload(); setSelectedEvent(null);})
            //Was in the line above but removed for debuggins purposes: console.log(response.data);
            .catch(error => {alert("Cannot delete event");});
        setConfirmDelete(false);   
    }

    const fetchTasks = async () => {
        const authToken = getCookie("authtoken");
        if(!authToken){
            window.location.href = "https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/";
        }else{
            const today = new Date();

            // Extract year, month, and day
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
            const day = today.getDate().toString().padStart(2, '0');

            // Build the string in the format "yyyy-mm-dd"
            const formattedDate = `${year}-${month}-${day}`;

            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);

            // Extract year, month, and day for the next week
            const yearNextWeek = nextWeek.getFullYear();
            const monthNextWeek = (nextWeek.getMonth() + 1).toString().padStart(2, '0');
            const dayNextWeek = nextWeek.getDate().toString().padStart(2, '0');

            // Build the string in the format "yyyy-mm-dd" for the next week
            const formattedDateNextWeek = `${yearNextWeek}-${monthNextWeek}-${dayNextWeek}`;

            const params = new URLSearchParams();
            params.append("authtoken", authToken);
            params.append("startdate", formattedDate);
            params.append("enddate", formattedDateNextWeek);

            const response = await axios.post(
                'https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/schedule-tasks.php',
                params.toString()
            );

            console.log(response.data.message);
            if(response.data.message === "No tasks"){
                console.log("No Tasks for user");
            }else{
                setTaskList(response.data.message);
                console.log(response.data.message);
            }
            
        }
      };

    useEffect(() => {
        fetchTasks();
      }, []);

    
 return (
    <div className = "Calendar">    
            <div className = "CalendarBackground" >
                <div className = "CalendarNavBar">
                    <form className="searchb" onClick={handleSearchOnClick}>
                        <input className="searchbar" type="search" id="searchInput" placeholder="Discover Users" value={searchQuery} onChange={handleSearchOnChange}/>
                    </form>
                    <ul>
                        <li><a href="/CSE442-542/2023-Fall/cse-442m/dashboard">Dashboard</a></li>
                        <button className="navbar-toggle"onClick={toggleTheme}>
                            {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        </button>

                        
                    </ul>
                </div>
                <br></br>
                <div className="CalendarContent">
                    <div className="calendar">
                        <div className="nav">
                            <button className="Month"onClick={handlePrevMonth}>&lt;</button>
                            <h2 className="Month">{format(currentMonth, 'MMMM yyyy')}</h2>
                            <button className="Month"onClick={handleNextMonth}>&gt;</button>
                        </div>
                        <div className = "days">
                        {daysInMonth.map((day, index) => {
                            const dayKey = day.toISOString().slice(0,10);
                            const daysEvents = events[dayKey];

                            return (
                                <div key={index} className="day">
                                    {format(day, 'd')}<br />
                                    {daysEvents && daysEvents.length > 0 ? (
                                        <>
                                        {daysEvents.length > 2 && showMoreDay !== dayKey && (
                                                <button className="show-more-button" onClick={() => setShowMoreDay(dayKey)}>
                                                    Show More
                                                </button>
                                            )}
                                            {daysEvents.slice(0,showMoreDay === dayKey ? daysEvents.length : 2).map((eventDescription, eventIndex) => (
                                               
                                                <div className={`event ${eventDescription.is_shared ? 'shared-event' : ''}`} key={eventIndex}>
                                                <button className={`event ${eventDescription.is_shared ? 'shared-event' : ''}`} onClick={() => setSelectedEvent(daysEvents[eventIndex])}>
                                                    {eventDescription.name} 
                                                </button>
                                                </div>
                                            ))}
                                            {showMoreDay === dayKey && (
                                                <button className="show-more-button" onClick={() => setShowMoreDay(null)}>
                                                    Show Less
                                                </button> 
                                            )}
                                        </>
                                    ) : null}
                                </div>
                            );
                        })}
                        </div>
                    </div>
                    {selectedEvent && !selectedEvent.is_shared && !confirmDelete && (
                        <div className="event-details">
                            <h3>Event Details</h3>
                            <p>Name: {selectedEvent.name}</p>
                            <p>Description: {selectedEvent.description}</p>
                            <p>Start Date: {selectedEvent.start_date}</p>
                            <p>Duration: {selectedEvent.duration} Hours</p>
                            <p>Location: {selectedEvent.location}</p>
                            <p><input 
                                placeholder = "Enter Friend's Username"
                                type="text"
                                id="sharedUser"
                                value={sharedUser}
                                onChange={handleSharedUserChange}
                            ></input></p>
                            <button onClick={handleOpenEditModal}>Edit Event</button>
                            <EditEventModal selectedEvent = {selectedEvent} isOpen={isEditModalOpen} onRequestClose={handleCloseEditModal} />
                            <button onClick={() => setSelectedEvent(null)}>Close</button>
                            <button onClick={() => shareEvent()}>Share</button>
                            <button type="submit" onClick={() => setConfirmDelete(true)}>Delete Event</button>
                        </div>
                    )}
                    {confirmDelete &&
                            <div className="delete-event">
                                <h1>Are you sure you want to delete {selectedEvent.name}?</h1>
                                <button onClick={() => setConfirmDelete(false)}>No</button>
                                <button type="submit" onClick={() => deleteEvent()}>Delete</button>
                            </div>
                        }
                    {selectedEvent && selectedEvent.is_shared &&  !confirmDelete &&(
                        <div className="shared-event-details">
                            <h3>Event Details</h3>
                            <p>Name: {selectedEvent.name}</p>
                            <p>Description: {selectedEvent.description}</p>
                            <p>Start Date: {selectedEvent.start_date}</p>
                            <p>Duration: {selectedEvent.duration} Hours</p>
                            <p>Location: {selectedEvent.location} </p>
                            <p><input 
                                type="text"
                                id="sharedUser"
                                value={sharedUser}
                                onChange={handleSharedUserChange}
                            ></input></p>
                            <button onClick={handleOpenEditModal}>Edit Event</button>
                            <EditEventModal selectedEvent = {selectedEvent} isOpen={isEditModalOpen} onRequestClose={handleCloseEditModal} />
                            <button onClick={() => setSelectedEvent(null)}>Close</button>
                            <button onClick={() => shareEvent()}>Share</button>
                            <button type="submit" onClick={() => setConfirmDelete(true)}>Delete Event</button>
                        </div>
                    )}
                    {confirmDelete &&
                            <div className="delete-event">
                                <h1>Are you sure you want to delete {selectedEvent.name}?</h1>
                                <button onClick={() => setConfirmDelete(false)}>No</button>
                                <button type="submit" onClick={() => deleteEvent()}>Delete</button>
                            </div>
                        }

                    <div className="add-event-button">
                        <button className="add-event" onClick={handleOpenModal}>
                            Add Event
                        </button>
                        <AddEventModal isOpen={isModalOpen} onRequestClose={handleCloseModal} />
                    </div>
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
                <div className="events-list">
                  <h1>Tasks for the Week:</h1>
                  {Array.isArray(taskList) && taskList.length > 0 ? (
                    taskList.map((task, index) => (
                    <div key={index}>
                        <p>Task Name: {task.name} </p> 
                        <p>Due Date: {task.due}</p>
                        <p>-------------------------</p>
                    </div>
                    ))
                    ) : (
                    <p>No tasks found</p>
                    )}   
                </div>
            </div>
       
    </div>
  );
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

};

export default Calendar;
