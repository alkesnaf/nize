import React, { useState } from 'react';
import Modal from 'react-modal';
import selectedEvent from './Calendar.js';
import axios from 'axios';
Modal.setAppElement('#root');

    const EditEventModal = ({isOpen, onRequestClose, selectedEvent}) => {
        const[name, setName] =  useState(selectedEvent.name);
        const[description, setDescription] = useState(selectedEvent.description);
        const [start_date, setStartDate] = useState(selectedEvent.start_date);
        const endDate = new Date(selectedEvent.start_date);
        console.log(selectedEvent.duration);
        endDate.setMinutes(endDate.getMinutes() +  selectedEvent.duration);
        const [end_date, setEndDate] = useState(endDate);
        const [start_time, setStartTime] = useState('');
        const [end_time, setEndTime] = useState('');
        const [location, setLocation] = useState('');
        const [event_id, setEventId] = useState(selectedEvent.event_id); 

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
          
          /*
          const deleteEvent = async () => {
            const delete_event_data = {
                event_id: event_id
            }
            const response = await axios.post('https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/delete-calendar-event.php', delete_event_data)
                .then(response => { console.log(response.data);})
                .catch(error => {alert("Cannot delete event");});
          }
          */

          const handleSubmit = async (e) => {
            e.preventDefault();
            const authToken = getCookie("authtoken");
            const date_date = start_date;
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

            const edit_event_data = {
                authtoken: authToken,
                name: name,
                description: description,
                start_date: date_date,
                end_date: end_date,
                start_time: start_time,
                end_time: end_time,
                duration: hourTime,
                location: location,
                event_id: event_id
            }

            const response = await axios.post('https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/edit-calendar-event.php', edit_event_data)
                .then(response => { console.log(response.data); })
                .catch(error => { alert("Cannot add event");});

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
          function getCookie(name) {
            const cookies = document.cookie.split("; ");
            for (const cookie of cookies) {
            const [cookieName, cookieValue] = cookie.split("=");
            if (cookieName === name){
                return decodeURIComponent(cookieValue);
                }
            }
            return null;
         }
          return (
            <Modal
                isOpen={isOpen}
                onRequestClose={onRequestClose}
                contentLabel="Edit Event Model"
            >
                <h2>Edit Event</h2>
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
                  <button type="submit">Save Changes</button>
                </form>
            </Modal>
          );
    };

    export default EditEventModal;



 
