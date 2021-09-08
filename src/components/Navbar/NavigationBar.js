import { React, Component } from 'react';
import { Navbar, Nav, Image } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/free-solid-svg-icons'
import { Link } from "react-router-dom";

import logo from '../../images/lazyslob-logo.png';
import '../../css/NavigationBar.css';

import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";
import socket from '../../services/socket';
import DOMPurify from 'dompurify';

// format the date to be readable from Date object
const formatDate = (d) => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const dateObj = new Date(d);
    const date = dateObj.getDate();
    const month = monthNames[dateObj.getMonth()];   // add leading 0 to month
    const year = dateObj.getFullYear();
    const hour = ("0" + dateObj.getHours()).slice(-2);   // add leading 0 to hour
    const minute = ("0" + (dateObj.getMinutes())).slice(-2);   // add leading 0 to minute
    const second = ("0" + (dateObj.getSeconds())).slice(-2);

    return `${month} ${date}, ${year} at ${hour}:${minute}:${second}`;
}

export default class NavigationBar extends Component {
    constructor(props) {
        super(props);
        this.logOut = this.logOut.bind(this);
        this.openTime = 0;
        this.openTimeInterval = null;

        this.state = {
            notifications: [],
            unreadList: [],
            unreadCount: 0
        }
    }

    componentDidMount = () => {
        if (!AuthService.isLoggedIn()) {
            return;
        }
        UserService.getUserNotifications(AuthService.getCurrentUser().id)
            .then(
                response => {
                    if (response.data) {
                        // user has more than 5 total notifications
                        if (response.data.length > 5) {
                            const temp = response.data;

                            // create array for all unread notifications
                            const unreadList = [];
                            temp.map(notification => {
                                !notification.read && unreadList.push(notification);
                            });

                            // no unread notifications,
                            // display notifications normally
                            if (unreadList.length == 0) {
                                this.setState({
                                    notifications: response.data,
                                    unreadCount: unreadList.length
                                });
                            }

                            // trim array to have only 5 unread notifications so
                            // only the latest 5 unread notifications get set to
                            // read when user opens the panel
                            else if (unreadList.length > 5) {
                                const unreadCount = unreadList.length;
                                const temp = [];
                                for (let i = 0; i < 5; i++) {
                                    temp.push(unreadList[i]);
                                }
                                this.setState({
                                    notifications: temp,
                                    unreadList: unreadList,
                                    unreadCount: unreadCount
                                });
                            }

                            // unread notifications less than 5,
                            // display all of them and display the latest
                            // read notifications after
                            else if (unreadList.length < 5) {
                                const readList = [];
                                const finalList = [];
                                temp.map(notification => {
                                    !notification.read && finalList.push(notification);
                                    notification.read && readList.push(notification);
                                });

                                // fill up the empty slots with
                                // the latest read notification(s)
                                for (let i = 0; i < 5 - finalList.length; i++) {
                                    finalList.push(readList[i]);
                                }

                                this.setState({
                                    notifications: finalList,
                                    unreadCount: unreadList.length
                                });
                            }

                            // user has 5 total unread notifications
                            // display unread notifications normally
                            else {
                                this.setState({
                                    notifications: unreadList,
                                    unreadCount: unreadList.length
                                });
                            }
                        }
                        // user has less than 5 total notifications
                        // display notifications normally
                        else {
                            //get unread count
                            let count = 0;
                            response.data.map(notification => {
                                !notification.read && count++;
                            });
                            this.setState({
                                notifications: response.data,
                                unreadCount: count
                            });
                        }
                    }
                })
            .catch((error) => {
                console.log(error);
            });

        socket.on("receiveNotifications", data => {
            const temp = this.state.notifications;
            // push new notification to first index
            temp.unshift(data);
            // add to unread notification count
            const unreadCountCount = this.state.unreadCount + 1;
            this.setState({
                notifications: temp,
                unreadCount: unreadCountCount
            });
        });
    }

    logOut = () => {
        AuthService.logout();
    }

    setReadAllNotifcations = () => {
        // reduce unread count
        const count = this.state.unreadCount - 5;
        this.setState({
            unreadCount: count < 0 ? 0 : count
        });

        UserService.setReadNotifications(
            this.state.notifications
        )
            .then(() => {

            })
            .catch((error) => {
                console.log(error);
            });
    }

    countPanelOpenTime = () => {
        if (this.state.unreadCount > 0) {
            const notificationPanel = document.getElementById("notification");
            const style = getComputedStyle(notificationPanel);

            if (style.visibility === "visible") {
                this.openTimeInterval = setInterval(() => {
                    this.openTime += 100;

                    // user opens panel for 3 seconds or more,
                    // stop timer and set notifications to read
                    if (this.openTime >= 3000) {
                        if (this.openTimeInterval) {
                            clearInterval(this.openTimeInterval);
                            this.openTimeInterval = null;

                            this.setReadAllNotifcations();
                        }
                    }
                }, 100);
            }
        }
    }

    stopTimer = () => {
        if (this.openTimeInterval) {
            clearInterval(this.openTimeInterval);
            this.openTimeInterval = null;
        }
        this.openTime = 0;
    }

    render = () => {
        const currentUser = this.props.obj;
        return (
            <div>
                <Navbar className="navbar" expand="lg" >
                    <Navbar.Brand>
                        <Link to="/">
                            <Image src={logo} fluid style={{ marginLeft: '1em', width: '3em', maxWidth: '3em', height: "100%" }} />
                        </Link>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls='basic-navbar-nav' />
                    <Navbar.Collapse id='basic-navbar-nav'>
                        <Nav className="nav">
                            <Link className="navbar-text navbar-item" to="/trades" >Trades</Link>
                            <Link className="navbar-text navbar-item" to="/cart">Cart</Link>

                            {/* show user panel user is logged in */}
                            {currentUser && (
                                <Link className="navbar-text navbar-item" to="/user">User Panel</Link>
                            )}
                            {/* show admin panel fi user is admin */}
                            {(currentUser && currentUser.isAdmin) && (
                                <Link className="navbar-text navbar-item" to="/admin/index">Admin Panel</Link>
                            )}
                        </Nav>

                        <span onMouseEnter={this.countPanelOpenTime} onMouseLeave={this.stopTimer}>
                            <Link to="/user/notifications" id="notification">
                                <div><FontAwesomeIcon icon={faBell} size="1x" /> Notifications</div>
                                {this.state.unreadCount > 0 &&
                                    <span className="badge">{this.state.unreadCount}</span>
                                }
                            </Link>
                            <div id="notification-panel">
                                {/* display if there are notifications in list */}
                                {this.state.notifications.length > 0 ? (
                                    <div>
                                        {/* loop through to list out the notifications */}
                                        {this.state.notifications.map((notification, index) => (
                                            <div key={index}>
                                                {/* display up to 5 items */}
                                                {index < 5 && (
                                                    <a
                                                        href={notification.url}
                                                        className={"notification-items " + (notification.read ? "notification-read" : "notification-unread")}
                                                    >
                                                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(notification.message) }} />
                                                        <div className="notification-date">{formatDate(notification.createdAt)}</div>
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                        {this.state.unreadList.length > 5 ? (
                                            <Link to="/user/notifications#unread">
                                                <div id="notification-view-more">
                                                    View more unread notifications here
                                                </div>
                                            </Link>
                                        ) : (
                                            <Link to="/user/notifications">
                                                <div id="notification-view-more">
                                                    View more
                                                </div>
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    // no notifications, display text
                                    <div style={{ padding: '1em 2em', textAlign: 'center' }}>
                                        <strong><h5>No Notifications</h5></strong>
                                    </div>
                                )}
                            </div>
                        </span>

                        {/* show username and logout button if logged in, otherwise, show log in and sign up buttons */}
                        <Nav>
                            {currentUser ? (
                                <span className="navbar-item">
                                    <button className="button1">
                                        <Link to="/user" id="username-text" className="button-text">
                                            {currentUser.username}
                                        </Link>
                                    </button>
                                </span>
                            ) : (
                                <span className="navbar-item">
                                    <button className="button1">
                                        <Link to="/login" className="button-text">Log In</Link>
                                    </button>
                                </span>
                            )}
                            {currentUser ? (
                                <span className="navbar-item">
                                    <button className="button2" onClick={this.logOut}>
                                        {/* Not <Link> because needs reload to refresh navigation bar */}
                                        <a href="/" className="button-text">Log Out</a>
                                    </button>
                                </span>
                            ) : (
                                <span className="navbar-item">
                                    <button className="button2">
                                        <Link to="/signup" className="button-text">Sign Up</Link>
                                    </button>
                                </span>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
                <div id="navbar-spacing"></div>
            </div>
        );
    }
}