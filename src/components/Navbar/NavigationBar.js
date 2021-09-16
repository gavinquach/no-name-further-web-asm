import { React, Component } from 'react';
import { Navbar, Nav, Image, NavDropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUserAlt, faSearch } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { Link, withRouter } from "react-router-dom";
import DOMPurify from 'dompurify';
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import Button from "react-validation/build/button";

import logo from '../../images/lazyslob-logo.png';
import '../../css/NavigationBar.css';

import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";
import socket from '../../services/socket';

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

class NavigationBar extends Component {
    constructor(props) {
        super(props);
        this.logOut = this.logOut.bind(this);
        this.openTime = 0;
        this.openTimeInterval = null;

        this.state = {
            notifications: [],
            unreadList: [],
            unreadCount: 0,
            search: ""
        }
    }

    componentDidMount = () => {
        const queryParams = new URLSearchParams(window.location.search);
        let keyword = queryParams.get('keyword');
        if (keyword) {
            keyword = unescape(keyword);  // escape html special characters
            this.setState({
                search: keyword
            });
        }

        if (AuthService.isLoggedIn()) {
            this.loadNotifications();

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

            // user selects "Mark all as read" or "Mark all as unread"
            // on user notifications page, reload notifications on
            // navigation bar
            socket.on("receiveNavBarNotificationsReloadRequest", () => {
                this.loadNotifications();
            });
        }
    }

    logOut = () => {
        AuthService.logout();
        this.props.history.push("/");
        window.location.reload();
    }

    loadNotifications = () => {
        UserService.getUserNotifications(
            AuthService.getCurrentUser().id
        ).then((response) => {
            if (response.data.notifications) {
                // user has more than 5 total notifications
                if (response.data.notifications.length > 5) {
                    const temp = response.data.notifications;

                    // create array for all unread notifications
                    const unreadList = [];
                    temp.map(notification => {
                        !notification.read && unreadList.push(notification);
                    });

                    // no unread notifications,
                    // display notifications normally
                    if (unreadList.length == 0) {
                        this.setState({
                            notifications: response.data.notifications,
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

                        const length = 5 - finalList.length;

                        // fill up the empty slots with
                        // the latest read notification(s)
                        for (let i = 0; i < length; i++) {
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
                    response.data.notifications.map(notification => {
                        !notification.read && count++;
                    });
                    this.setState({
                        notifications: response.data.notifications,
                        unreadCount: count
                    });
                }
            }
        }).catch((error) => {
            if (error.response && error.response.status != 500) {
                console.log(error.response.data.message);
            } else {
                console.log(error);
            }
        });
    }

    setReadNotification = (notification) => {
        // reduce unread count
        const count = this.state.unreadCount - 1;
        this.setState({
            unreadCount: count < 0 ? 0 : count
        });

        UserService.setReadNotification(
            notification
        ).then(() => {
        }).catch((error) => {
            if (error.response && error.response.status != 500) {
                console.log(error.response.data.message);
            } else {
                console.log(error);
            }
        });
    }

    setReadAllNotifcations = () => {
        // reduce unread count
        const count = this.state.unreadCount - 5;
        this.setState({
            unreadCount: count < 0 ? 0 : count
        });

        UserService.setReadNotifications(
            this.state.notifications
        ).then(() => {
            // send request to reload notifications to user notifications page
            socket.emit("requestReloadNotifications", AuthService.getCurrentUser().id);
        }).catch((error) => {
            if (error.response && error.response.status != 500) {
                console.log(error.response.data.message);
            } else {
                console.log(error);
            }
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

    onChangeSearch = (value) => {
        this.setState({
            search: value
        });
    }

    handleSearch = (e) => {
        e.preventDefault();
        let keyword = this.state.search;
        keyword = keyword.trim();   // trim whitespaces
        keyword = escape(keyword);  // escape html special characters
        keyword = encodeURIComponent(keyword);   // encode
        this.props.history.push(`/search?keyword=${keyword}`);
        window.location.reload();
    }

    render = () => {
        const currentUser = this.props.obj;

        const user = <FontAwesomeIcon icon={faUserAlt} />
        const facebook = <FontAwesomeIcon icon={faFacebookF} />
        const google = <FontAwesomeIcon icon={faGoogle} />

        return (
            <div>
                <Navbar className="navbar" expand="lg" >
                    <Navbar.Brand>
                        <Link to="/">
                            <Image src={logo} fluid style={{ marginLeft: '1em', width: '3em', maxWidth: '3em', height: "100%" }} />
                        </Link>
                    </Navbar.Brand>
                    <Form id="search-form-small" method="GET" onSubmit={this.handleSearch}>
                        <Input
                            id="search-bar-small"
                            name="keyword"
                            value={this.state.search}
                            onChange={(e) => this.onChangeSearch(e.target.value)}
                        />
                        <Button type="submit" className="SubmitSearchBtn">
                            <FontAwesomeIcon icon={faSearch} />
                        </Button>
                    </Form>
                    <Navbar.Toggle aria-controls='basic-navbar-nav' />

                    <Navbar.Collapse id='basic-navbar-nav'>
                        {AuthService.isLoggedIn() ? (
                            <Nav className="nav">
                                <Link className="navbar-text navbar-item" to="/user/trades" >My Trades</Link>
                                <Link className="navbar-text navbar-item" to="/cart">My Cart</Link>

                                {/* show user panel user is logged in */}
                                {currentUser && (
                                    <Link className="navbar-text navbar-item" to="/user">User Panel</Link>
                                )}
                                {/* show admin panel fi user is admin */}
                                {(currentUser && currentUser.isAdmin) && (
                                    <Link className="navbar-text navbar-item" to="/admin/index">Admin Panel</Link>
                                )}
                            </Nav>
                        ) : (
                            <Nav className="nav" />
                        )}
                        <Nav className="nav">
                        </Nav>

                        <Nav className="nav">
                            <Form id="search-form" method="GET" onSubmit={this.handleSearch}>
                                <Input
                                    id={AuthService.isLoggedIn() ? (AuthService.isAdmin() ? "search-bar-admin" : "search-bar") : "search-bar-not-logged-in"}
                                    name="keyword"
                                    value={this.state.search}
                                    onChange={(e) => this.onChangeSearch(e.target.value)}
                                />
                                <Button type="submit" className="SubmitSearchBtn">
                                    <FontAwesomeIcon icon={faSearch} />
                                </Button>
                            </Form>
                        </Nav>

                        <span onMouseEnter={this.countPanelOpenTime} onMouseLeave={this.stopTimer}>
                            <Link to="/user/notifications" id="notification">
                                <div><FontAwesomeIcon icon={faBell} size="1x" /> Notifications</div>
                                {this.state.unreadCount > 0 &&
                                    <span className="badge">{this.state.unreadCount}</span>
                                }
                            </Link>
                            {AuthService.isLoggedIn() ? (
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
                                                            onClick={() => this.setReadNotification(notification)}
                                                        >
                                                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(notification.message) }} />
                                                            <div className="notification-date">{formatDate(notification.createdAt)}</div>
                                                        </Nav.Link>
                                                    )}
                                                </div>
                                            ))}
                                            {this.state.unreadList.length > 5 ? (
                                                <Link to="/user/notifications#unread" className="notification-view-more">
                                                    <div style={{ paddingBottom: '10px' }}>
                                                        View more unread notifications here
                                                    </div>
                                                </Link>
                                            ) : (
                                                <Link to="/user/notifications" className="notification-view-more">
                                                    <div style={{ paddingBottom: '10px' }}>
                                                        View more
                                                    </div>
                                                </Link>
                                            )}
                                        </div>
                                    ) : (
                                        // no notifications, display text
                                        <div style={{ padding: '1em 2em', textAlign: 'center', marginTop: '7.25em' }}>
                                            <h4>No notifications</h4>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div id="notification-panel">
                                    <div style={{
                                        padding: '1em 2em',
                                        textAlign: 'center',
                                        verticalAlign: 'middle',
                                        marginTop: '3em',
                                    }}>
                                        <h4>Please log in to see notifications</h4>
                                        <hr />
                                        <Link to="/login" className="notification-view-more">
                                            Log in
                                        </Link>
                                        <hr />
                                        <Link to="/signup" className="notification-view-more">
                                            Sign up
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </span>

                        {/* show username and logout button if logged in, otherwise, show log in and sign up buttons */}
                        <Nav>
                            {currentUser ? (
                                <span className="Nav-bar-item Push-left">
                                    <NavDropdown className="Nav-bar-text Nav-bar-item"
                                        title={
                                            <Link to="/user">
                                                <button className="Nav-bar-text button1" >
                                                    {currentUser.username}
                                                </button>
                                            </Link>
                                        }
                                        id="basic-nav-dropdown"
                                        renderMenuOnMount={true}>
                                        <NavDropdown.Item as={Link} to="/user" >
                                            <span to="/user" className="text-dark">
                                                <button className="btn-warning Sign-up-btn nav-btn button-spec Nav-link">
                                                    Profile
                                                </button>
                                            </span>
                                        </NavDropdown.Item>
                                        <NavDropdown.Divider />
                                        <NavDropdown.Item as={Link} to="/">
                                            <span to="/" className="text-white">
                                                <button className="btn-danger Sign-up-btn nav-btn button-spec Nav-link" onClick={this.logOut}>
                                                    Log Out
                                                </button>
                                            </span>
                                        </NavDropdown.Item>
                                    </NavDropdown>
                                </span>
                            ) : (
                                <span className="Nav-bar-item Push-left">
                                    <NavDropdown className="Nav-bar-text Nav-bar-item"
                                        title={
                                            <Link to="/login">
                                                <button className="Nav-bar-text button1">
                                                    {user} Log In
                                                </button>
                                            </Link>
                                        }
                                        id="basic-nav-dropdown"
                                        renderMenuOnMount={true}>
                                        <NavDropdown.Item as={Link} to="/login">
                                            <span to="/login" className="text-dark">
                                                <button className="btn-warning Log-in-out-btn nav-btn button-spec Nav-link">
                                                    Log In
                                                </button>
                                            </span>
                                        </NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/signup">
                                            <span to="/signup" className="text-dark">
                                                <button className="btn-warning Sign-up-btn nav-btn button-spec Nav-link">
                                                    Sign Up
                                                </button>
                                            </span>
                                        </NavDropdown.Item>
                                        {/* <NavDropdown.Divider />
                                        <NavDropdown.Item as={Link} to="#">
                                            <span to="#" id="username-text" className="text-white">
                                                <button className="btn p-2 btn-primary nav-btn button-spec Nav-link">
                                                    {facebook} Login with Facebook
                                                </button>
                                            </span>
                                        </NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="#">
                                            <span to="#" id="username-text" className="text-white">
                                                <button className="btn p-2 btn-danger nav-btn button-spec Nav-link">
                                                    {google} Sign in with Google+
                                                </button>
                                            </span>
                                        </NavDropdown.Item> */}
                                    </NavDropdown>
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

export default withRouter(NavigationBar);   // withRouter for this.props.history