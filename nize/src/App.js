import React, {useState} from 'react';
import './App.css';
import Calendar from './components/Calendar';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import ForgotPassword from './components/ForgotPassword';
import AccountRecovery from './components/AccountRecovery';
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Discover from "./components/Discover"
import Profile from "./components/Profile"
import FileUpload from './components/FileUpload';
import {ThemeProvider} from './components/Theme';
import AboutUs from './components/AboutUs';
import Todo from './components/Todo';

function App() {
  return (
      <ThemeProvider>
      <BrowserRouter basename={"/CSE442-542/2023-Fall/cse-442m"}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/password" element={<ForgotPassword/>} />
          <Route path="/recover" element={<AccountRecovery/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/calendar" element={<Calendar/>} />
          <Route path='/dashboard' element={<Dashboard/>} />
          <Route path="/discover/:username" element={<Discover/>} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/fileupload" element={<FileUpload />} />
          <Route path="/todo" element={<Todo />} />
          <Route path="/" element={<Home/>} />
          <Route path="*" element={<NoPage/>} />
          <Route path="/aboutus" element={<AboutUs/>} />
        </Routes>
      </BrowserRouter>
      </ThemeProvider>
    ); 
}

export default App;

function NoPage() {
  return <h2>No page at requested path</h2>;
}
