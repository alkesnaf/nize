import React, { useState } from 'react';
import Modal from 'react-modal';

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

  const handleSubmit = (e) => {
    e.preventDefault();

  setName('');
  setDescription('');
  setStartDate('');
  setEndDate('');
  setStartTime('');
  setEndTime('');
  setLocation('');
  onRequestClose();
  };

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
            type="text"
            id="start_date"
            value={start_date}
            onChange={handleStartDateChange}
          />
        </div>
        <div>
          <label htmlFor="end_date">End Date:</label>
          <input
            type="text"
            id="end_date"
            value={end_date}
            onChange={handleEndDateChange}
          />
        </div>
        <div>
          <label htmlFor="start_time">Start Time:</label>
          <input
            type="text"
            id="start_time"
            value={start_time}
            onChange={handleStartTimeChange}
          />
        </div>
        <div>
          <label htmlFor="end_time">End Time:</label>
          <input
            type="text"
            id="end_time"
            value={end_time}
            onChange={handleEndTimeChange}
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
