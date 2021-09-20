import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faTimes, faPaperPlane, faCheck } from '@fortawesome/free-solid-svg-icons';

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
        this.waitTime = 0;
        this.waitTimeInterval = null;
        this.loading = false;
        this.openingChat = false;
        this.onChangeMessage = this.onChangeMessage.bind(this);

        this.state = {
            chatOpened: localStorage.getItem("chatOpened") && localStorage.getItem("chatOpened"),
            conversations: [],
            message: "",
            messages: [],
            conversationId: null,
            receiver: null,
            currentUser: AuthService.isLoggedIn() ? AuthService.getCurrentUser() : null,
            page: 1,
            totalPages: 0,
            totalUnreadCount: 0,
            status: ""
        };
    }

    onChangeMessage = (e) => {
        this.setState({
            message: e.target.value
        });
    }

    componentDidMount = () => {
        window.scrollTo(0, 0); // automatically scroll to top
        if (AuthService.isLoggedIn()) {
            this.load();

            // when the other user has read the message
            socket.on("receiveMessageRead", user => {
                if (user == this.state.currentUser.id) {
                    // add delay to not instantly update the
                    // the status and act like the message really
                    // got after a period of processing
                    setTimeout(() => {
                        this.setState({ status: "read" });
                    }, 500);
                }
            });

            // when user receives a message
            socket.on("receiveMessage", message => {
                this.updateConversationList();

                // user has chat panel opened
                if (document.getElementById("chat-panel").classList.contains("ShowChatPanel")) {
                    // user is chatting with the person/opening the chat box
                    // that has same conversation id as message sent
                    if (this.state.conversationId == message.conversationId) {
                        // push message 
                        const temp = this.state.messages;
                        temp.push(message);

                        // check if user's scroll is at the bottom
                        let isScrollAtBottom = false;
                        const chat = document.getElementById("chat-bubbles");
                        if (chat && (chat.scrollTop == (chat.scrollHeight - chat.offsetHeight) || chat.scrollTop >= (chat.scrollHeight - chat.offsetHeight) * 0.8)) {
                            isScrollAtBottom = true;
                        }

                        // update to display the newest messages
                        this.setState({
                            messages: temp,
                        }, () => {
                            // set messages to read only when the chat
                            // is scrolled all the way down or close to that
                            const chat = document.getElementById("chat-bubbles");
                            if (chat) {
                                // automatically scroll down if user's scroll is around the bottom
                                if (isScrollAtBottom) {
                                    chat.scrollTop = chat.scrollHeight;
                                    this.setMessagesToRead(message.conversationId);
                                }
                                // scroll not around the bottom, add 1 to unread and update conversation
                                else {
                                    this.setState({
                                        totalUnreadCount: this.state.totalUnreadCount + 1
                                    });
                                    this.updateConversation(message.conversationId, false);
                                }
                            }
                        });
                    }
                    // user is not opening the conversation from message's conversationid
                    else {
                        this.getAllUnreadCount();
                    }
                }
                // user is not opening chat panel
                else {
                    if (this.state.conversationId) {
                        this.getMessages(message.conversationId);
                    }
                    this.setState({
                        totalUnreadCount: this.state.totalUnreadCount + 1
                    });
                }
            });

            // user clicked on "Chat with user" button
            socket.on("receivechatWithUserRequest", data => {
                // open chat panel
                if (!this.state.chatOpened) {
                    this.setState({ chatOpened: true });
                    const panel = document.getElementById("chat-panel");
                    panel.classList.remove("HideChatPanel");
                    panel.classList.add("ShowChatPanel");

                    // store in local storage to keep track
                    // when users go to another page
                    localStorage.chatOpened = true;
                }

                // conversation not found, create conversation
                ChatService.postConversation(
                    data.user,
                    data.receiver
                ).then(() => {
                    ChatService.getConversationsRequest(this.state.currentUser.id)
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
                                                updatedAt: obj.updatedAt,
                                                unreadCount: obj.unreadCount
                                            });
                                        }
                                    });
                                });

                                // sort from newest date to oldest
                                conversationList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

                                this.setState({
                                    conversations: conversationList
                                }, () => {
                                    this.getAllUnreadCount();
                                    this.setChatPanelState();
                                    const conversation = this.state.conversations[0];
                                    this.setChatTarget(conversation);
                                    this.setState({ receiver: conversation.user._id });
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
                }).catch((error) => {
                    // conversation already exists
                    if (error.response && error.response.status == 401) {
                        // has conversation with this user already,
                        // switch chat target to this conversation
                        const temp = error.response.data.conversation;
                        let otherUser = null;
                        temp.members.map((user) => {
                            if (user != this.state.currentUser.id) {
                                otherUser = user;
                            }
                        });

                        const conversation = {
                            _id: temp._id,
                            user: otherUser,
                            updatedAt: temp.updatedAt
                        };

                        this.setChatTarget(conversation);
                        this.setState({ receiver: conversation.user });
                    } else if (error.response && error.response.status != 500) {
                        console.log(error.response.data.message);
                    } else {
                        console.log(error);
                    }
                });
            });
        } else {
            this.setChatPanelState();
        }
    }

    load = () => {
        ChatService.getConversations(this.state.currentUser.id)
            .then((response) => {
                const temp = response.data.conversations;
                const conversationList = [];
                temp.map((obj,) => {
                    obj.members.map((user) => {
                        if (user._id != this.state.currentUser.id) {
                            conversationList.push({
                                _id: obj._id,
                                user: user,
                                updatedAt: obj.updatedAt,
                                unreadCount: obj.unreadCount
                            });
                        }
                    });
                });

                // sort from newest date to oldest
                conversationList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

                this.setState({
                    conversations: conversationList,
                    conversationId: localStorage.getItem("conversationId") ? localStorage.getItem("conversationId") : null
                }, () => {
                    this.getAllUnreadCount();
                    this.setChatPanelState();
                    // has conversation id, get messages and set receiver id
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
                    if (localStorage.getItem("chatOpened") == "true") {
                        this.setMessagesToRead(this.state.conversationId);
                    }
                });
            }).catch((error) => {
                if (error.response && error.response.status != 500) {
                    console.log(error.response.data.message);
                } else {
                    console.log(error);
                }
                this.setChatPanelState();
            });
    }

    onScrollSetToRead = () => {
        if (this.openingChat) return;
        // set messages to read when user scrolls in chat
        // this will also set messages to read when new messages
        const chat = document.getElementById("chat-bubbles");

        if (chat) {
            // no scroll bar available
            if (chat.scrollHeight <= chat.clientHeight) {
                return;
            }

            // load older messages when the scroll is very close to the top
            if (chat.scrollTop == 0 || chat.scrollTop < (chat.scrollHeight - chat.offsetHeight) * 0.05) {
                if (this.state.totalPages > 0 && this.state.page >= this.state.totalPages) {
                    return;
                }
                if (this.loading) return;
                this.loading = true;

                if (!this.waitTimeInterval) {
                    this.waitTimeInterval = setInterval(() => {
                        this.waitTime += 100;

                        // user keeps the scroll at the top for 1 second,
                        // load new messages
                        if (this.waitTime >= 500) {
                            this.stopTimer();
                            this.loading = false;

                            ChatService.getMessages(
                                this.state.conversationId,
                                "-createdAt",
                                this.state.page + 1,
                                10,
                            ).then((response) => {
                                const messages = response.data.messages;
                                const temp = this.state.messages;

                                // insert new messages to the start
                                // of current messages array
                                messages.map((message) => {
                                    temp.unshift(message);
                                });

                                this.setState({
                                    messages: temp,
                                    page: this.state.page + 1,
                                    totalPages: response.data.totalPages
                                }, () => {
                                    // move scroll down to the current
                                    // message after loading older messages,
                                    // value retrieved through trial and error
                                    chat.scrollTop += chat.scrollHeight * 0.30;
                                });
                            }).catch((error) => {
                                if (error.response && error.response.status != 500) {
                                    console.log(error.response.data.message);
                                } else {
                                    console.log(error);
                                }
                                this.setState({
                                    messages: []
                                });
                            });
                        }
                    }, 100);
                }
            }
            // user's scroll position close to the bottom,
            // set messages to read
            else if (chat.scrollTop == (chat.scrollHeight - chat.offsetHeight) || chat.scrollTop == (chat.scrollHeight - chat.offsetHeight) * 0.85) {
                this.loading = false;
                this.stopTimer();

                // has unread messages
                if (this.state.totalUnreadCount > 0) {
                    const temp = this.state.conversations;
                    // get conversation id
                    temp.map((conversation) => {
                        if (conversation._id == this.state.conversationId) {
                            // set conversation unread count to 0
                            if (conversation.unreadCount > 0) {
                                conversation.unreadCount = 0;
                            }
                        }
                    });
                    this.setState({
                        conversations: temp
                    }, () => {
                        // set conversation messages to read
                        this.setMessagesToRead(this.state.conversationId);
                    });
                }
            }
            // scroll is around the middle area
            else {
                this.loading = false;
                this.stopTimer();
            }
        }
    }

    stopTimer = () => {
        if (this.waitTimeInterval) {
            clearInterval(this.waitTimeInterval);
            this.waitTimeInterval = null;
        }
        this.waitTime = 0;
    }

    getAllUnreadCount = () => {
        // get total unread count for user
        ChatService.getUserUnreadMessages(
            this.state.currentUser.id,
        ).then((response) => {
            this.setState({
                totalUnreadCount: response.data.total
            });
        }).catch((error) => {
            if (error.response && error.response.status != 500) {
                console.log(error.response.data.message);
            } else {
                console.log(error);
            }
        });
    }

    updateConversation = (conversationId, read) => {
        if (!conversationId) {
            return;
        }
        ChatService.getConversationById(conversationId)
            .then((response) => {
                let temp = null;
                response.data.members.map((user) => {
                    if (user._id != this.state.currentUser.id) {
                        temp = {
                            _id: response.data._id,
                            user: user,
                            updatedAt: response.data.updatedAt,
                            unreadCount: response.data.unreadCount
                        };
                    }
                });

                let tempList = this.state.conversations;
                tempList.map((conversation) => {
                    if (conversation._id == temp._id) {
                        conversation.updatedAt = temp.updatedAt;
                    }
                });
                this.setState({ conversations: tempList });
            }).catch((error) => {
                if (error.response && error.response.status != 500) {
                    console.log(error.response.data.message);
                } else {
                    console.log(error);
                }
            });
    }

    updateConversationList = () => {
        ChatService.getConversations(this.state.currentUser.id)
            .then((response) => {
                const temp = response.data.conversations;
                const conversationList = [];
                temp.map((obj,) => {
                    obj.members.map((user) => {
                        if (user._id != this.state.currentUser.id) {
                            conversationList.push({
                                _id: obj._id,
                                user: user,
                                updatedAt: obj.updatedAt,
                                unreadCount: obj.unreadCount
                            });
                        }
                    });
                });

                // sort from newest date to oldest
                conversationList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

                this.setState({ conversations: conversationList });
            }).catch((error) => {
                if (error.response && error.response.status != 500) {
                    console.log(error.response.data.message);
                } else {
                    console.log(error);
                }
            });
    }

    //  get localstorage item and open chat or close chat panel
    setChatPanelState = () => {
        if (localStorage.getItem("chatOpened") == "true") {
            this.setState({
                chatOpened: true
            });
            const panel = document.getElementById("chat-panel");
            if (panel) {
                panel.classList.remove("HideChatPanel");
                panel.classList.add("ShowChatPanel");
            }
        } else {
            this.setState({
                chatOpened: false
            });
            const panel = document.getElementById("chat-panel");
            if (panel) {
                panel.classList.remove("ShowChatPanel");
                panel.classList.add("HideChatPanel");
            }
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
                receiver: conversation.user._id ? conversation.user._id : conversation.user,
                page: 1
            });
            this.getMessages(conversationId);

            if (conversation.unreadCount && conversation.unreadCount > 0) {
                this.setMessagesToRead(conversationId);
            }
        }
    }

    toggleChat = () => {
        // chat is currently opened, close it
        if (this.state.chatOpened) {
            this.setState({ chatOpened: false });
            const panel = document.getElementById("chat-panel");
            panel.classList.remove("ShowChatPanel");
            panel.classList.add("HideChatPanel");

            // store in local storage to keep track
            // when users go to another page
            localStorage.chatOpened = false;
        }
        // chat is currently closed, open it
        else {
            this.setState({ chatOpened: true });
            const panel = document.getElementById("chat-panel");
            panel.classList.remove("HideChatPanel");
            panel.classList.add("ShowChatPanel");

            // store in local storage to keep track
            // when users go to another page
            localStorage.chatOpened = true;

            // set opening chat to true to prevent the scroll
            // functions from running while it's opening
            this.openingChat = true;

            // has unread message
            if (this.state.totalUnreadCount > 0) {
                // automatically set messages in conversation to read upon open
                const chat = document.getElementById("chat-bubbles");
                if (chat) {
                    // set timer because of CSS transition delay,
                    // otherwise the clientHeight value will always be 6
                    setTimeout(() => {
                        // chat has scrollwheel
                        if (chat.scrollHeight > chat.clientHeight) {
                            this.openingChat = false;

                            // if scroll is at the top or around the top,
                            // automatically scroll chat to bottom
                            if (chat.scrollTop == (chat.scrollHeight - chat.offsetHeight) || chat.scrollTop == (chat.scrollHeight - chat.offsetHeight) * 0.85) {
                                this.setMessagesToRead(this.state.conversationId);
                            }
                        }
                        // chat has no scrollwheel
                        else {
                            this.openingChat = false;
                            this.setMessagesToRead(this.state.conversationId);
                        }
                    }, 400);
                }
            }
        }
    }

    setMessagesToRead = (conversationId) => {
        // check if the panel is currently opened
        if (document.getElementById("chat-panel").classList.contains("ShowChatPanel")
            && document.getElementById(conversationId)) {
            ChatService.setMessagesToRead(
                conversationId,
                this.state.currentUser.id
            ).then(() => {
                socket.emit("messageRead", this.state.receiver);
                this.getAllUnreadCount();
            }).catch((error) => {
                if (error.response && error.response.status != 500) {
                    console.log(error.response.data.message);
                } else {
                    console.log(error);
                }
            });
        }
    }

    // get messages and set them to read
    getMessages = (conversationId) => {
        ChatService.getMessages(
            conversationId,
            "-createdAt",
            1,
            10,
        ).then((response) => {
            // sort to display messages in the correct order
            const messages = response.data.messages.sort((a, b) =>
                new Date(a.createdAt) - new Date(b.createdAt)
            );

            if (messages[messages.length - 1].read) {
                this.setState({ status: "read" });
            } else {
                this.setState({ status: "sent" });
            }

            this.setState({
                messages: messages,
                page: 1,
                totalPages: response.data.totalPages
            }, () => {
                const chat = document.getElementById("chat-bubbles");
                // chat has no scrollwheel
                if (chat && chat.scrollHeight <= chat.clientHeight) {
                    this.setMessagesToRead(conversationId);
                }
                // chat has scrollwheel
                else {
                    // automatically scroll chat to bottom
                    // which will also set all messages to read
                    // from onScrollSetToRead() function
                    chat.scrollTop = chat.scrollHeight;
                }
            });
        }).catch((error) => {
            if (error.response && error.response.status != 500) {
                console.log(error.response.data.message);
            } else {
                console.log(error);
            }
            this.setState({
                messages: []
            });
        });
    }

    sendMessage = (e) => {
        e.preventDefault();

        // require user to have a user selected in order to send message
        if (this.state.conversationId == null || this.state.conversationId == "") {
            return;
        }
        // don't allow sending empty strings
        if (this.state.message === null || this.state.message == "") {
            return;
        }
        // don't allow message with only whitespaces
        if (this.state.message && this.state.message.trim() === '') {
            return
        }

        const message = {
            conversationId: this.state.conversationId,
            sender: this.state.currentUser.id,
            receiver: this.state.receiver,
            text: this.state.message
        };

        ChatService.postMessage(message)
            .then((response) => {
                // sent request to update the chat box on the other side
                socket.emit("sendMessage", response.data);

                // push message to the chat box
                const temp = this.state.messages;
                temp.push(message);

                // set conversation id and update to display the newest messages
                this.setState({
                    conversationId: response.data.conversationId,
                    message: "",
                    messages: temp,
                    status: ""
                }, () => {
                    // add delay to not instantly update the
                    // the status and act like the message really
                    // got after a period of processing
                    setTimeout(() => {
                        this.setState({ status: "sent" });

                        // automatically scroll chat to bottom again
                        // after status message is set
                        const chat = document.getElementById("chat-bubbles");
                        chat.scrollTop = chat.scrollHeight;
                    }, 500);

                    // automatically scroll chat to bottom
                    const chat = document.getElementById("chat-bubbles");
                    chat.scrollTop = chat.scrollHeight;

                    // clear input field
                    const input = document.getElementById("input");
                    input.value = "";

                    // update timestamp of conversation
                    this.updateConversation(this.state.conversationId, true);
                });
            }).catch((error) => {
                if (error.response && error.response.status != 500) {
                    console.log(error.response.data.message);
                } else {
                    console.log(error);
                }
            });
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
            else if ((index > 1 && message.sender == messages[index - 1].sender)
                && (index == messages.length - 1 || (index < messages.length - 1 && message.sender != messages[index + 1].sender))) {
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
            else if ((index > 1 && message.receiver == messages[index - 1].receiver)
                && (index == messages.length - 1 || (index < messages.length - 1 && message.receiver != messages[index + 1].receiver))) {
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
                            {this.state.totalUnreadCount > 0 && (
                                <span className="badge">{this.state.totalUnreadCount}</span>
                            )}
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
                                    {conversation.unreadCount > 0 && (
                                        <div className="UnreadMessageText"><b>{conversation.unreadCount} unread</b></div>
                                    )}
                                    <div className="UserListItemsDate">{formatDate(conversation.updatedAt)}</div>
                                </div>
                            ))}
                        </div>
                        <div id="chat-box">
                            <ul id="chat-bubbles" onScroll={this.onScrollSetToRead}>
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
                                        <span>
                                            {/* format and display current user's message */}
                                            <li key={`${index}-${message.sender}`}
                                                className={"ChatBubble SentMessages ".concat(
                                                    this.formatBubble(this.state.messages, message, index, "sent")
                                                )}>
                                                {message.text}
                                            </li>
                                            {(index == this.state.messages.length - 1) && (
                                                <span>
                                                    {this.state.status == "read" && (
                                                        <div className="ChatBubble SentMessageCheckMarks">
                                                            <FontAwesomeIcon icon={faCheck} />
                                                            {this.state.status}
                                                        </div>
                                                    )}
                                                    {this.state.status == "sent" && (
                                                        <span>
                                                            <div className="ChatBubble SentMessageCheckMarks">
                                                                {this.state.status}
                                                            </div>
                                                        </span>
                                                    )}
                                                </span>
                                            )}
                                        </span>
                                    )
                                ))
                                }
                            </ul>
                            {this.state.conversationId ? (
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
                            ) : (
                                <div id="input-area" disabled>
                                    <input
                                        id="input"
                                        type="text"
                                        placeholder="Type your message..."
                                        disabled
                                    />
                                    <button id="fa-icon-send-disabled">
                                        <FontAwesomeIcon icon={faPaperPlane} id="#fa-icon-send-disabled" />
                                    </button>
                                </div>
                            )}
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