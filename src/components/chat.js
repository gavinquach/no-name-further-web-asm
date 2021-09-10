import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faTimes, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

import "../css/Chat.css"

import AuthService from '../services/auth.service';
import ChatService from '../services/chat.service';
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
        this.onChangeMessage = this.onChangeMessage.bind(this);

        this.state = {
            chatOpened: localStorage.getItem("chatOpened") && localStorage.getItem("chatOpened"),
            conversations: [],
            message: "",
            messages: [],
            conversationId: null,
            receiver: null,
            currentUser: AuthService.isLoggedIn() ? AuthService.getCurrentUser() : null
        };
    }

    onChangeMessage(e) {
        this.setState({
            message: e.target.value
        });
    }

    componentDidMount = () => {
        if (AuthService.isLoggedIn()) {
            ChatService.getConversations(this.state.currentUser.id)
                .then(
                    response => {
                        const temp = response.data.conversations;
                        const conversationList = [];
                        temp.map((obj,) => {
                            obj.members.map((user) => {
                                if (user._id != this.state.currentUser.id) {
                                    conversationList.push({
                                        _id: obj._id,
                                        user: user,
                                        updatedAt: obj.updatedAt
                                    });
                                }
                            });
                        });

                        this.setState({
                            conversations: conversationList,
                            conversationId: localStorage.getItem("conversationId") ? localStorage.getItem("conversationId") : null
                        }, () => {
                            this.setChatPanelState();
                            // has conversation id, get messages and receiver id
                            if (this.state.conversationId) {
                                this.getMessages(this.state.conversationId);

                                // set receiver id
                                for (const conversation of conversationList) {
                                    if (conversation._id == this.state.conversationId) {
                                        this.setState({ receiver: conversation.user._id });
                                        break;
                                    }
                                }
                            }
                        });
                    })
                .catch((error) => {
                    if (error.response && error.response.status != 500) {
                        console.log(error.response.data.message);
                    } else {
                        console.log(error);
                    }
                    this.setChatPanelState();
                });

            socket.on("receiveMessage", msg => {
                if (this.state.conversationId == msg.conversationId) {
                    this.getMessages(msg.conversationId);
                }
            });
        } else {
            this.setChatPanelState();
        }
    }

    //  get localstorage item and open chat or close chat panel
    setChatPanelState = () => {
        if (localStorage.getItem("chatOpened") == "true") {
            this.setState({
                chatOpened: true
            });
            const panel = document.getElementById("chat-panel");
            panel.classList.remove("HideChatPanel");
            panel.classList.add("ShowChatPanel");
        } else {
            this.setState({
                chatOpened: false
            });
            const panel = document.getElementById("chat-panel");
            panel.classList.remove("ShowChatPanel");
            panel.classList.add("HideChatPanel");
        }

        if (this.state.conversationId || this.state.conversationId != "") {
            // highlight user list item
            const elems = document.getElementsByClassName("UserListItems");
            for (let i = 0; i < elems.length; i++) {
                const elem = elems[i];
                elem.classList.remove("HighlightItem");
            }
            const elem = document.getElementById(this.state.conversationId);
            if (elem) document.getElementById(this.state.conversationId).classList.add("HighlightItem");
        }
    }

    setChatTarget = (conversation) => {
        const conversationId = conversation._id;
        // if target is not already highlighted/chosen
        // to prevent being able to reload the same data
        if (!document.getElementById(conversationId).classList.contains("HighlightItem")) {
            // highlight user list item
            const elems = document.getElementsByClassName("UserListItems");
            for (let i = 0; i < elems.length; i++) {
                const elem = elems[i];
                elem.classList.remove("HighlightItem");
            }
            document.getElementById(conversationId).classList.add("HighlightItem");

            // set localstorage so the page can remember
            // which user the user was chatting with
            if (localStorage.getItem("conversationId")) {
                localStorage.conversationId = conversationId;
            } else {
                localStorage.setItem("conversationId", conversationId);
            }

            this.setState({
                conversationId: conversationId,
                receiver: conversation.user._id
            });
            this.getMessages(conversationId);
        }
    }

    toggleChat = () => {
        if (this.state.chatOpened) {
            this.setState({ chatOpened: false });
            const panel = document.getElementById("chat-panel");
            panel.classList.remove("ShowChatPanel");
            panel.classList.add("HideChatPanel");

            // store in local storage to keep track
            // when users go to another page
            localStorage.chatOpened = false;
        } else {
            this.setState({ chatOpened: true });
            const panel = document.getElementById("chat-panel");
            panel.classList.remove("HideChatPanel");
            panel.classList.add("ShowChatPanel");

            // store in local storage to keep track
            // when users go to another page
            localStorage.chatOpened = true;
        }
    }

    // get messages and set them to read
    getMessages = (conversationId) => {
        ChatService.getMessages(conversationId)
            .then(
                response => {
                    this.setState({
                        messages: response.data.messages
                    }, () => {
                        // automatically scroll chat to bottom
                        const elem = document.getElementById("chat-bubbles");
                        elem.scrollTop = elem.scrollHeight;
                    });
                })
            .catch((error) => {
                if (error.response && error.response.status != 500) {
                    console.log(error.response.data.message);
                } else {
                    console.log(error);
                }
                this.setState({
                    messages: []
                });
            });

        ChatService.setMessagesToRead(conversationId)
            .then(() => { })
            .catch((error) => {
                if (error.response && error.response.status != 500) {
                    console.log(error.response.data.message);
                } else {
                    console.log(error);
                }
                this.setChatPanelState();
            });
    }

    sendMessage = (e) => {
        e.preventDefault();

        // don't allow sending empty strings
        if (this.state.message != "") {
            const message = {
                conversationId: this.state.conversationId,
                sender: this.state.currentUser.id,
                receiver: this.state.receiver,
                text: this.state.message
            };

            ChatService.postMessage(message)
                .then(
                    response => {
                        // set conversation id, clear input field,
                        // and update to display the newest messages
                        this.setState({
                            conversationId: response.data.conversationId,
                            message: ""
                        }, () => {
                            this.getMessages(response.data.conversationId);
                            const elem = document.getElementById("input");
                            elem.value = "";
                        });
                    })
                .catch((error) => {
                    if (error.response && error.response.status != 500) {
                        console.log(error.response.data.message);
                    } else {
                        console.log(error);
                    }
                });
        }
    }

    formatBubble = (messages, message, index, user) => {
        let classes = "";
        if (index < messages.length - 1 && message.sender == messages[index + 1].sender) {
            classes = classes.concat("SmallGap ");
        } else {
            classes = classes.concat("BigGap ");
        }

        if (user == "sent") {
            // bubble is in between two bubbles
            if ((index < messages.length - 1 && message.sender == messages[index + 1].sender)
                && (index > 0 && message.sender == messages[index - 1].sender)) {
                classes = classes.concat("SquareBothRight ");
            }
            // bubble is on top of another bubble and 
            // there's no bubble above it
            else if ((index < messages.length - 1 && message.sender == messages[index + 1].sender)
                && (index - 1 < 0 || (index > 0 && message.sender != messages[index - 1].sender))) {
                classes = classes.concat("SquareBottomRight ");
            }
            // bubble is below another bubble and 
            // there's no bubble below it
            else {
                classes = classes.concat("SquareTopRight ");
            }
        } else if (user == "received") {
            // bubble is in between two bubbles
            if ((index < messages.length - 1 && message.receiver == messages[index + 1].receiver)
                && (index > 0 && message.receiver == messages[index - 1].receiver)) {
                classes = classes.concat("SquareBothLeft ");
            }
            // bubble is on top of another bubble and 
            // there's no bubble above it
            else if ((index < messages.length - 1 && message.receiver == messages[index + 1].receiver)
                && (index - 1 < 0 || (index > 0 && message.receiver != messages[index - 1].receiver))) {
                classes = classes.concat("SquareBottomLeft ");
            }
            // bubble is below another bubble and 
            // there's no bubble below it
            else {
                classes = classes.concat("SquareTopLeft ");
            }
        }
        return classes;
    }

    render() {
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

                {!this.state.currentUser && (
                    <div id="chat-panel" className="HideChatPanel">
                        <h3 id="text-for-user">Please log in to start chatting</h3>
                    </div>
                )}
                {(this.state.currentUser && this.state.conversations.length > 0) && (
                    <div id="chat-panel" className="HideChatPanel">
                        <div id="user-list">
                            {this.state.conversations.map((conversation) => (
                                <div key={conversation._id} id={conversation._id} className="UserListItems" onClick={() => this.setChatTarget(conversation)}>
                                    <b>{conversation.user.username}</b>
                                    <div className="UserListItemsDate">{formatDate(conversation.updatedAt)}</div>
                                </div>
                            ))}
                        </div>
                        <div id="chat-box">
                            <ul id="chat-bubbles">
                                {this.state.messages.map((message, index) => (
                                    // receiver is current user
                                    message.receiver == this.state.currentUser.id ? (
                                        // format and display other user's message
                                        <li key={`${index}-${message.receiver}`}
                                            className={"ChatBubble ReceivedMessages ".concat(
                                                this.formatBubble(this.state.messages, message, index, "received")
                                            )}>
                                                {message.text}
                                        </li>
                                    ) : (
                                        // format and display current user's message
                                        <li key={`${index}-${message.sender}`}
                                            className={"ChatBubble SentMessages ".concat(
                                                this.formatBubble(this.state.messages, message, index, "sent")
                                            )}>
                                                {message.text}
                                        </li>
                                    )
                                ))
                                }
                            </ul>
                            <form id="input-area" onSubmit={this.sendMessage}>
                                <input
                                    id="input"
                                    type="text"
                                    placeholder="Type your message..."
                                    onChange={this.onChangeMessage}
                                />
                                <button type="submit" id="fa-icon-send">
                                    <FontAwesomeIcon icon={faPaperPlane} />
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {(this.state.currentUser && this.state.conversations.length < 1) && (
                    <div id="chat-panel" className="HideChatPanel">
                        <h3 id="text-for-user">No conversations found.</h3>
                    </div>
                )}
            </div>
        );
    }
}