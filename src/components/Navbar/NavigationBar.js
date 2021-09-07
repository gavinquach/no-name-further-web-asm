import { React, Component } from 'react';
import { Navbar, Nav, Image } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/free-solid-svg-icons'

import logo from '../../images/lazyslob-logo.png';
import '../../css/NavigationBar.css'

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
        if (this.state.unreadCount > 0) {
            // add delay to sync up with CSS 0.3s animation
            setTimeout(() => {
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
            }, 300);
        }
    }

    render = () => {
        const currentUser = this.props.obj;
        return (
            <div>
                <Navbar className="navbar" expand="lg" >
                    <Navbar.Brand href="/"><Image src={logo} fluid style={{ marginLeft: '1em', width: '3em', maxWidth: '3em', height: "100%" }} /></Navbar.Brand>
                    <Navbar.Toggle aria-controls='basic-navbar-nav' />
                    <Navbar.Collapse id='basic-navbar-nav'>
                        <Nav className="nav">
                            <Nav.Link className="navbar-text navbar-item" href="/transactions" >Transactions</Nav.Link>
                            <Nav.Link className="navbar-text navbar-item" href="/cart">Cart</Nav.Link>

                            {/* show user panel user is logged in */}
                            {currentUser && (
                                <Nav.Link className="navbar-text navbar-item" href="/user/index">User Panel</Nav.Link>
                            )}
                            {/* show admin panel fi user is admin */}
                            {(currentUser && currentUser.isAdmin) && (
                                <Nav.Link className="navbar-text navbar-item" href="/admin/index">Admin Panel</Nav.Link>
                            )}
                        </Nav>

                        <Nav id="notification" onMouseEnter={this.setReadAllNotifcations}>
                            <div><FontAwesomeIcon icon={faBell} size="1x" /> Notifications</div>
                            {this.state.unreadCount > 0 &&
                                <span className="badge">{this.state.unreadCount}</span>
                            }
                        </Nav>
                        <div id="notification-panel">
                            {/* display if there are notifications in list */}
                            {this.state.notifications.length > 0 ? (
                                <div>
                                    {/* loop through to list out the notifications */}
                                    {this.state.notifications.map((notification, index) => (
                                        <div key={index}>
                                            {/* display up to 5 items */}
                                            {index < 5 && (
                                                <Nav.Link
                                                    href={notification.url}
                                                    className={"notification-items " + (notification.read ? "notification-read" : "notification-unread")}
                                                >
                                                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(notification.message) }}></div>
                                                    <div className="notification-date">{formatDate(notification.createdAt)}</div>
                                                </Nav.Link>
                                            )}
                                        </div>
                                    ))}
                                    {this.state.unreadList.length > 5 ? (
                                        <Nav.Link href="/notifications/unread" id="notification-view-more">
                                            View more unread notifications here
                                        </Nav.Link>
                                    ) : (
                                        <Nav.Link href="/notifications" id="notification-view-more">
                                            View more
                                        </Nav.Link>
                                    )}
                                </div>
                            ) : (
                                // no notifications, display text
                                <div style={{ padding: '1em 2em', textAlign: 'center' }}>
                                    <strong><h5>No Notifications</h5></strong>
                                </div>
                            )}
                        </div>

                        {/* show username and logout button if logged in, otherwise, show log in and sign up buttons */}
                        <Nav>
                            {currentUser ? (
                                <span className="navbar-item">
                                    <button className="button1">
                                        <Nav.Link href="/user" id="username-text" className="button-text">
                                            {currentUser.username}
                                        </Nav.Link>
                                    </button>
                                </span>
                            ) : (
                                <span className="navbar-item">
                                    <button className="button1">
                                        <Nav.Link href="/login" className="button-text">Log In</Nav.Link>
                                    </button>
                                </span>
                            )}
                            {currentUser ? (
                                <span className="navbar-item">
                                    <button className="button2" onClick={this.logOut}>
                                        <Nav.Link href="/" className="button-text">Log Out</Nav.Link>
                                    </button>
                                </span>
                            ) : (
                                <span className="navbar-item">
                                    <button className="button2">
                                        <Nav.Link href="/signup" className="button-text">Sign Up</Nav.Link>
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