import React, { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios'
import selectedEvent from './Calendar.js';
Modal.setAppElement('#root');

    const AddEventModal = ({ isOpen, onRequestClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [start_date, setStartDate] = useState('');
    const [end_date, setEndDate] = useState('');
    const [start_time, setStartTime] = useState('');
    const [end_time, setEndTime] = useState('');
    const [location, setLocation] = useState('');

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
  };

  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);
  };

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const authToken = getCookie("authtoken");
    const date_date = start_date; // this shows we need to do some processng (ryan we talk)
    //const s_time = Date.parse(start_date);
    //const e_time = Date.parse(end_date);

    const s_time = new Date(start_date).getTime();
    const e_time = new Date(end_date).getTime();

    if(!isNaN(s_time) && !isNaN(e_time)){
      const time = (e_time - s_time) / (1000*60);
      const hourTime = time / 60;
      //const milli = e_time - s_time;
      //const duration = milli /(1000*60);
      //const hourTime = duration / 60;

    

    const new_event_data = {
        authtoken: authToken, 
        name: name, 
        description: description, 
        start_date: date_date, 
        end_date: end_date,
        start_time: start_time,
        end_time: end_time,
        duration: hourTime, 
        location : location
    }
    const response = await axios.post('https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/add-calendar-event.php', new_event_data)
        .then(response =>{
            console.log(response.data);
        }).catch(error => { alert("ON MY MOMMA");});





  setName('');
  setDescription('');
  setStartDate('');
  setEndDate('');
  setStartTime('');
  setEndTime('');
  setLocation('');
  window.location.reload();
  onRequestClose();
      }
  };

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

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Add Event Modal"
    >
      <h2>Add Event</h2>
      <form onSubmit={handleSubmit}>
      <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleNameChange}
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={handleDescriptionChange}
          />
        </div>
        <div>
          <label htmlFor="start_date">Start Date:</label>
          <input
            type="datetime-local"
            id="start_date"
            value={start_date}
            onChange={handleStartDateChange}
          />
        </div>
        <div>
          <label htmlFor="end_date">End Date:</label>
          <input
            type="datetime-local"
            id="end_date"
            value={end_date}
            onChange={handleEndDateChange}
          />
       </div>
        <div>
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={handleLocationChange}
          />
        </div>
        <button type="submit">Save Event</button>
      </form>
    </Modal>
  );
};

export default AddEventModal;
