import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faTimes, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

import "../css/Chat.css"

import AuthService from '../services/auth.service';
import UserService from '../services/user.service';
import socket from '../services/socket';

// format the date to be readable from Date object
const formatDate = (d) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const dateObj = new Date(d);
    const date = dateObj.getDate();
    const month = monthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    const hour = ("0" + dateObj.getHours()).slice(-2);   // add leading 0 to hour
    const minute = ("0" + (dateObj.getMinutes())).slice(-2);   // add leading 0 to minute
    const second = ("0" + (dateObj.getSeconds())).slice(-2);

    const currentDate = new Date();

    // conversation at least 1-year old
    if (currentDate.getFullYear() > year) {
        return `${month} ${date}, ${year}`;
    }
    // conversation at least 1-day old
    else if (currentDate.getDate() > date) {
        return `${month} ${date}`;
    }
    return `${hour}:${minute}:${second}`;
}

export default class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chatOpened: localStorage.getItem("chatOpened") && localStorage.getItem("chatOpened"),
            messages: []
        };
    }

    componentDidMount = () => {
        if (localStorage.getItem("chatOpened") == "true") {
            this.setState({
                chatOpened: true
            });
            const panel = document.getElementById("chat-panel");
            panel.classList.remove("HideChatPanel");
            panel.classList.add("ShowChatPanel");
        } else if (localStorage.getItem("chatOpened") == "false") {
            this.setState({
                chatOpened: false
            });
            const panel = document.getElementById("chat-panel");
            panel.classList.remove("ShowChatPanel");
            panel.classList.add("HideChatPanel");
        }
        // UserService.getUserMessages(AuthService.getCurrentUser().id)
        //     .then(
        //         response => {
        //             this.setState({
        //                 messages: response.data
        //             });
        //         })
        //     .catch((error) => {
        //         console.log(error);
        //     });

        // socket.on("receiveMessages", data => {
        //     // push new message to first index
        //     const temp = this.state.messages;
        //     temp.unshift(data);
        //     this.setState({
        //         messages: temp
        //     });
        // });
    }

    toggleChat = () => {
        if (this.state.chatOpened) {
            this.setState({ chatOpened: false });
            const panel = document.getElementById("chat-panel");
            panel.classList.remove("ShowChatPanel");
            panel.classList.add("HideChatPanel");
            localStorage.chatOpened = false;
        } else {
            this.setState({ chatOpened: true });
            const panel = document.getElementById("chat-panel");
            panel.classList.remove("HideChatPanel");
            panel.classList.add("ShowChatPanel");
            localStorage.chatOpened = true;
        }
    }

    sendMessage = () => {

    }

    render() {
        const username = "username";
        const date = new Date();
        return (
            <div>
                <span onClick={this.toggleChat}>
                    {this.state.chatOpened === false ? (
                        <div className="ChatButton CloseChatButton">
                            <FontAwesomeIcon id="fa-icon-comment" icon={faCommentDots} />
                        </div>
                    ) : (
                        <div className="ChatButton OpenChatButton">
                            <FontAwesomeIcon id="fa-icon-cross" icon={faTimes} />
                        </div>
                    )}
                </span>
                <div id="chat-panel" className="HideChatPanel">
                    <div id="user-list">
                        <div className="UserListItems">
                            {username}
                            <div className="UserListItemsDate">{formatDate(date)}</div>
                        </div>
                        <div className="UserListItems">
                            {username}
                            <div className="UserListItemsDate">{formatDate(date)}</div>
                        </div>
                        <div className="UserListItems">
                            {username}
                            <div className="UserListItemsDate">{formatDate(date)}</div>
                        </div>
                        <div className="UserListItems">
                            {username}
                            <div className="UserListItemsDate">{formatDate(date)}</div>
                        </div>
                        <div className="UserListItems">
                            {username}
                            <div className="UserListItemsDate">{formatDate(date)}</div>
                        </div>
                        <div className="UserListItems">
                            {username}
                            <div className="UserListItemsDate">{formatDate(date)}</div>
                        </div>
                        <div className="UserListItems">
                            {username}
                            <div className="UserListItemsDate">{formatDate(date)}</div>
                        </div>
                        <div className="UserListItems">
                            {username}
                            <div className="UserListItemsDate">{formatDate(date)}</div>
                        </div>
                    </div>
                    <div id="chat-box">
                        <div id="chat-bubbles">

                        </div>
                        <div id="input-area">
                            <input
                                id="input"
                                type="text"
                                placeholder="Type your message..."
                            />
                            <span id="fa-icon-send" onClick={this.sendMessage}>
                                <FontAwesomeIcon icon={faPaperPlane} />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}