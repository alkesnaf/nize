import React, { useState } from 'react';
import Modal from 'react-modal';
import selectedTodo from './Todo.js';
import axios from 'axios';
Modal.setAppElement('#root');

    const EditTodoModal = ({isOpen, onRequestClose, selectedTodo}) => {
        const[name, setName] =  useState(selectedTodo.name);
        const[description, setDescription] = useState(selectedTodo.description);
        const [due_date, setDueDate] = useState(selectedTodo.due_date);
        const endDate = new Date(selectedTodo.due_date);
        const[duration, setDuration] = useState(selectedTodo.duration);
        const [todo_id, setTodoId] = useState(selectedTodo.todo_id); 

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

          /*
          const deleteTodo = async () => {
            const delete_todo_data = {
                todo_id: todo_id
            }
            const response = await axios.post('https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/delete-todo.php', delete_todo_data)
                .then(response => { console.log(response.data);})
                .catch(error => {alert("Cannot delete todo");});
          }
          */

          const handleSubmit = async (e) => {
            e.preventDefault();
            const authToken = getCookie("authtoken");
            const date_date = due_date;

            const edit_todo_data = {
                authtoken: authToken,
                name: name,
                description: description,
                due_date: date_date,
                duration: duration,
                todo_id: todo_id
            }

            const response = await axios.post('https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/edit-todo.php', edit_todo_data)
                .then(response => { console.log(response.data); })
                .catch(error => { console.log(error);});

            setName('');
            setDescription('');
            setDueDate('');
            setDuration('');
            window.location.reload();
            onRequestClose();
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
                contentLabel="Edit Todo Model"
            >
                <h2>Edit Todo</h2>
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
                  <label htmlFor="due_date">Due Date:</label>
                  <input
                    type="datetime-local"
                    id="due_date"
                    value={due_date}
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
                  <button type="submit">Save Changes</button>
                </form>
            </Modal>
          );
    };

    export default EditTodoModal;



 
