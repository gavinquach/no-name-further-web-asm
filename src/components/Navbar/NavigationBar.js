import { React, Component } from 'react';
import { Navbar, Nav, Image } from 'react-bootstrap';

import logo from '../../images/lazyslob-logo.png';
import '../../css/NavigationBar.css'

import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";
import socket from '../../services/socket';
import DOMPurify from 'dompurify';

export default class NavigationBar extends Component {
    constructor(props) {
        super(props);
        this.logOut = this.logOut.bind(this);

        this.state = {
            notifications: []
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
                        const temp = response.data;
                        // sort from newest to oldest
                        temp.sort((a, b) => {
                            return new Date(b.createdAt) - new Date(a.createdAt);
                        });

                        this.setState({
                            notifications: temp
                        });
                    }
                })
            .catch((error) => {
                console.log(error);
            });

        socket.on("receiveNotifications", data => {
            const temp = this.state.notifications;
            const notification = {
                url: data.url,
                message: data.message
            };
            // push new notification to first index
            temp.unshift(notification);
            this.setState({
                notifications: temp
            });
        });
    }

    logOut = () => {
        AuthService.logout();
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

                        <Nav className="notification">
                            <div>Notifications</div>
                            {this.state.notifications.length > 0 &&
                                <span className="badge">{this.state.notifications.length}</span>
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
                                                <Nav.Link href={notification.url} className="notification-items"
                                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(notification.message) }}>
                                                </Nav.Link>
                                            )}
                                            {/* display "View more" for 6th item */}
                                            {index == 5 && (
                                                <Nav.Link href="/notifications" id="notification-view-more">
                                                    View more
                                                </Nav.Link>
                                            )}
                                        </div>
                                    ))}
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