import './Todo.css'
import React, { useState, useEffect } from 'react';
import axios from 'axios'
import AddTodoModal from './AddTodoModal';
import EditTodoModal from './EditTodoModal';
import { useTheme } from './Theme';


const Todo = () => {

    /* Todo looks like this
    *  {name: str, dueDate: str, isChecked: bool } 
    */
    const [isChecked, setIsChecked] = useState(false);
    const [todos, setTodos] = useState([]);
    const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedTodo, setSelectedTodo] = useState(null);
    const [isEditTodoModalOpen, setIsEditTodoModalOpen] = useState(false);
    const {darkMode, toggleTheme} = useTheme();
    
    const handleCheckboxChange = () => {
        setIsChecked(prevState => !prevState);
    };
    
    const handleOpenTodoModal = () => {
        setIsTodoModalOpen(true);
    }
    const handleCloseTodoModal = () => {
        setIsTodoModalOpen(false);
    }
    
    const handleOpenEditTodoModal = () => {
        setIsEditTodoModalOpen(true);
    }
    const handleCloseEditTodoModal = () => {
        setIsEditTodoModalOpen(false);
    }
    const deleteTodo = async () => {
        const authToken = getCookie("authtoken");
        const delete_todo_data = {
            authtoken: authToken,
            todo_id: selectedTodo.todo_id
        }
        const response = await axios.post('https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/delete-todo.php', delete_todo_data)
            .then(response => {console.log(response.data); window.location.reload(); setSelectedTodo(null);})
            .catch(error => {console.log(error);});
        setConfirmDelete(false);   
    }

    useEffect(() => {
        const authToken = getCookie("authtoken");
        const response = axios.get('https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/todo.php',
        {
            params: {authtoken: authToken},
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                },
        }
        )
        .then( response => {
            let toBeAdded = [];
            for(let t of response.data){
                let dt = JSON.parse(t);
                toBeAdded.push(dt);
                
            }
            setTodos( toBeAdded );

            console.log("Events:", toBeAdded);
        });
    }, []);
    
   
    return (
        <div className="Todo">
            <div className="TodoNavBar">
                <ul>
                    <li><a href="/CSE442-542/2023-Fall/cse-442m/dashboard">Dashboard</a></li>
                    <button className="navbar-toggle"onClick={toggleTheme}>
                        {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    </button>
                </ul>
            </div>
            <br></br>
                <div className="TodoTitle">
                    <h1> What to do</h1>
                </div>
                {todos.map((todo, index) => {
                    const toggleCheck = ()  => {
                        console.log("toggle");
                    const authToken = getCookie("authtoken");
                    const toggle_data = { authtoken: authToken, todo_id: todo.todo_id};

                    const response = axios.post('https://www-student.cse.buffalo.edu/CSE442-542/2023-Fall/cse-442m/backend/todo_toggle.php', toggle_data)
                        .then( response => {
                        window.location.reload();
                        console.log(response);
                        });
                    };
                    
                    return(
                        <div className="TodoContent">
                            <div className="layout">
                                <div className="todo-item">
                                <label className="check-box">
                                <input type="checkbox" checked={todo.completed} onChange={toggleCheck} />
                                <span className="checkmark" />
                                 </label>
                                    <div className="left-side">
                                        <button className="todo-button" onClick={() => {setSelectedTodo(todo); console.log("setting")}}>{todo.name}</button>
                                    </div>
                                    <div className="divider"></div>
                                    <div className="right-side">
                                        <p>Due: {todo.due_date}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                );})}

                {selectedTodo &&  !confirmDelete && (
                    <div className="event-details">
                        <h3>Todo Details</h3>
                        <p>Name: {selectedTodo.name}</p>
                        <p>Description: {selectedTodo.description}</p>
                        <p>Due Date: {selectedTodo.due_date}</p>
                        <p>Duration: {selectedTodo.duration} Hours</p>
                        <button onClick={handleOpenEditTodoModal}>Edit Todo</button>
                        <EditTodoModal selectedTodo = {selectedTodo} isOpen={isEditTodoModalOpen} onRequestClose={handleCloseEditTodoModal} />
                        <button onClick={() => setSelectedTodo(null)}>Close</button>
                        <button type="submit" onClick={() => setConfirmDelete(true)}>Delete Todo</button>
                    </div>
                )}
                {confirmDelete &&
                        <div className="delete-event">
                            <h1>Are you sure you want to delete {selectedTodo.name}?</h1>
                            <button onClick={() => setConfirmDelete(false)}>No</button>
                            <button type="submit" onClick={() => deleteTodo()}>Delete</button>
                        </div>
                    } 
                {confirmDelete &&
                        <div className="delete-event">
                            <h1>Are you sure you want to delete {selectedTodo.name}?</h1>
                            <button onClick={() => setConfirmDelete(false)}>No</button>
                            <button type="submit" onClick={() => deleteTodo()}>Delete</button>
                        </div>
                    }

                <div className="add-task-button">
                    <button className="add-task" onClick={handleOpenTodoModal}>
                        Add Task
                    </button>
                    <AddTodoModal isOpen={isTodoModalOpen} onRequestClose={handleCloseTodoModal} />
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

export default Todo;
