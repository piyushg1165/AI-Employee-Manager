import axios from 'axios';
import React, { use, useEffect, useState } from 'react'
import { createContext } from 'react'
import { useNavigate } from 'react-router-dom';
import api from "../api/axios.js"


const Context = createContext();

export default function Main(props) {
    
    const user = JSON.parse(localStorage.getItem("user"));
    const [userData, setUserData] = useState(null);
    const [userChats, setUserChats] = useState([]);
    const [userMessages, setUserMessages] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);

   useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
        setUserData(storedUser);
        fetchChats(storedUser.id); // call only when token is ready
    }
}, []);


    if (!userData && user) {
        setUserData(user);
    }
    
const fetchChats = (id) => {
    let API = `/chat/getChatsByUserId/${id}`;
    api.get(API,{withCredentials: true})
    .then((success) => {
        setUserChats(success.data?.chats || []);
    })
    .catch((err) => {
        setUserChats([]);
        console.log("Error fetching chats:", err);
    });
};

const fetchMessages = (chatId) => {
  console.log("Fetching messages for chat ID:", chatId);
  if (!chatId) return;

  let API = `/chat/getAllMessagesByChatId/${chatId}`;

  api.get(API, { withCredentials: true })
    .then(success => {
      if (success.data?.messages) {
        setUserMessages(success.data.messages);
        console.log("Fetched messages:", success.data.messages);
      } else {
        setUserMessages([]);
      }
    })
    .catch(err => {
      console.log("Error fetching messages:", err);
      setUserMessages([]);
    });
};





    return (
        <Context.Provider value={{ userChats, userData, currentChat,setUserMessages, setCurrentChat, setUserData, fetchChats, fetchMessages, userMessages }}>
            {props.children}
        </Context.Provider>
    )
}

export { Context };
