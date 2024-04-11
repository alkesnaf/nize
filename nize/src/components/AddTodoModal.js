import React, { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios'
import selectedTodo from './Todo.js';
Modal.setAppElement('#root');

    const AddTodoModal = ({ isOpen, onRequestClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [duration, setDuration] = useState('');

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleDueDateChange = (e) => {
    setDueDate(e.target.value);
  };

  const handleDurationChange = (e) => {
    setDuration(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const authToken = getCookie("authtoken");
    const date_date = dueDate; // this shows we need to do some processng (ryan we talk)

    const new_todo_data = {
        authtoken: authToken, 
        name: name, 
        description: description, 
        due_date: dueDate,
        duration: duration, 
    }
    const response = await axios.post('https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/add-todo.php', new_todo_data)
        .then(response =>{
            console.log(response.data);
        }).catch(error => { alert(error);});

  setName('');
  setDescription('');
  setDueDate('');
  setDuration('');
  window.location.reload();
  onRequestClose();
      
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
      contentLabel="Add Todo Modal"
    >
      <h2>Add Todo</h2>
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
          <label htmlFor="dueDate">Due Date:</label>
          <input
            type="datetime-local"
            id="dueDate"
            value={dueDate}
            onChange={handleDueDateChange}
          />
        </div>
        <div>
          <label htmlFor="duration">Duration:</label>
          <input
            type="text"
            id="duration"
            value={duration}
            onChange={handleDurationChange}
          />
        </div>
        <button type="submit">Save Todo</button>
      </form>
    </Modal>
  );
};

export default AddTodoModal;
