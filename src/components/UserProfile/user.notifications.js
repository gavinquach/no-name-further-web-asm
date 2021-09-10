import React, { Component } from 'react';
import { Helmet } from "react-helmet";
import DOMPurify from 'dompurify';

import logo from '../../images/lazyslob-logo.png';
import '../../css/Notifications.css';

import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";
import socket from '../../services/socket';

import ProfileSideBar from "./user.profile.sidebar"
import { Link, Redirect } from 'react-router-dom';

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

export default class Notifications extends Component {
    constructor(props) {
        super(props);
        this.state = {
            notifications: [],
            message: "You have no notifications.",
            currentPage: parseInt(new URLSearchParams(window.location.search).get('page')),
            totalPages: 0,
            pageButtons: [],
            limit: 10
        };
    }

    load = () => {
        // get hash value in URL
        const hash = window.location.hash.replace("#", "");
        if (hash == "unread") {
            UserService.getUserUnreadNotifications(
                AuthService.getCurrentUser().id,
                "-createdAt",
                this.state.currentPage,
                this.state.limit
            ).then(response => {
                this.setState({
                    totalPages: response.data.totalPages,
                    notifications: response.data.notifications,
                    message: "No unread notifications."
                }, () => this.loadPageButtons());
            }).catch((error) => {
                if (error.response && error.response.status != 500) {
                    console.log(error.response.data.message);
                } else {
                    console.log(error);
                }
            });
        }

        // system notifications
        else if (hash == "system") {
            UserService.getUserNotificationsByType(
                AuthService.getCurrentUser().id,
                hash,
                "-createdAt",
                this.state.currentPage,
                this.state.limit
            ).then(response => {
                this.setState({
                    totalPages: response.data.totalPages,
                    notifications: response.data.notifications,
                    message: `You have no ${hash} notifications.`
                }, () => this.loadPageButtons());
            }).catch((error) => {
                if (error.response && error.response.status != 500) {
                    console.log(error.response.data.message);
                } else {
                    console.log(error);
                }
            });
        }

        // trade notifications
        else if (hash == "trade") {
            UserService.getUserNotificationsByType(
                AuthService.getCurrentUser().id,
                hash,
                "-createdAt",
                this.state.currentPage,
                this.state.limit
            ).then(response => {
                this.setState({
                    totalPages: response.data.totalPages,
                    notifications: response.data.notifications,
                    message: `You have no ${hash} notifications.`
                }, () => this.loadPageButtons());
            }).catch((error) => {
                if (error.response && error.response.status != 500) {
                    console.log(error.response.data.message);
                } else {
                    console.log(error);
                }
            });
        }

        // all notifications
        else {
            UserService.getUserNotifications(
                AuthService.getCurrentUser().id,
                "-createdAt",
                this.state.currentPage,
                this.state.limit
            ).then(response => {
                this.setState({
                    totalPages: response.data.totalPages,
                    notifications: response.data.notifications,
                    message: `You have no notifications.`
                }, () => this.loadPageButtons());
            }).catch((error) => {
                if (error.response && error.response.status != 500) {
                    console.log(error.response.data.message);
                } else {
                    console.log(error);
                }
            });
        }
    }

    componentDidMount() {
        this.load();

        // get hash value in URL
        const hash = window.location.hash.replace("#", "");

        // update notification list in real-time
        // when user receives one
        socket.on("receiveNotifications", data => {
            if (hash == "" || hash == "all" || hash == "system") {
                if (data.type == "system") {
                    const temp = this.state.notifications;
                    temp.unshift(data);
                    this.setState({
                        notifications: temp
                    });
                }
            } else if (hash == "" || hash == "all" || hash == "unread") {
                if (data.type == "trade") {
                    const temp = this.state.notifications;
                    temp.unshift(data);
                    this.setState({
                        notifications: temp
                    });
                }
            }
        });
    }

    getNotifications = () => {
        setTimeout(() => {
            this.load();
        }, 100);
    }

    updatePage = (page) => {
        this.setState({
            currentPage: page
        }, () => this.load());
    }

    loadPageButtons = () => {
        if (this.state.currentPage > this.state.totalPages) {
            return;
        }

        // get URL for redirect
        const url = new URL(window.location.href);
        const search_params = url.searchParams;

        const buttons = [];
        if (this.state.currentPage > 1) {
            const prevPage = this.state.currentPage - 1;
            search_params.set("page", prevPage);
            const pageURL = url.pathname + "?" + search_params.toString();

            buttons.push(
                <Link to={pageURL} onClick={() => this.updatePage(prevPage)}>
                    <button>Previous</button>
                </Link>
            );
        }
        for (let i = 1; i <= this.state.totalPages; i++) {
            // replace page number with index number
            search_params.set("page", i);
            const pageURL = url.pathname + "?" + search_params.toString();

            if (i === this.state.currentPage) {
                buttons.push(
                    <button disabled>{i}</button>
                )
            } else {
                buttons.push(
                    <Link to={pageURL} onClick={() => this.updatePage(i)}>
                        <p className="page-button" style={{ display: "inline", margin: '0px 8px' }}>{i}</p>
                    </Link>
                )
            }
        }
        if (this.state.currentPage < this.state.totalPages) {
            const nextPage = this.state.currentPage + 1;
            search_params.set("page", nextPage);
            const pageURL = url.pathname + "?" + search_params.toString();

            buttons.push(
                <Link to={pageURL} onClick={() => this.updatePage(nextPage)}>
                    <button>Next</button>
                </Link>
            );
        }
        this.setState({ pageButtons: buttons });
    }

    render() {
        // ========== validate GET parameters ==========
        const url = new URL(window.location.href);
        const search_params = url.searchParams;
        const page = search_params.get("page");
        if (!page || page === "") {
            search_params.set("page", 1);
            const pageURL = url.pathname + "?" + search_params.toString();
            return <Redirect to={pageURL} />
        }
        // ========== end of GET param validation ==========
        return (
            <div className="page-container my-profile">
                <Helmet>
                    <title>{AuthService.getCurrentUser().username}'s Notifications</title>
                </Helmet>
                <ProfileSideBar />
                <div className="profile-page">
                    <div className="title">Notifications</div>
                    <hr className="section-line" />
                    <div className="NotificationTypes">
                        <div className="NotificationTypesRow" onClick={this.getNotifications}>
                            <a href="#all"
                                className={"NotificationTypesCell ".concat(
                                    (window.location.hash == "" || window.location.hash == "#all") && (
                                        "active"
                                    )
                                )}>
                                All
                            </a>
                            <a href="#system"
                                className={"NotificationTypesCell ".concat(
                                    (window.location.hash == "#system") && (
                                        "active"
                                    )
                                )}>
                                System
                            </a>
                            <a href="#trade"
                                className={"NotificationTypesCell ".concat(
                                    (window.location.hash == "#trade") && (
                                        "active"
                                    )
                                )}>
                                Trade
                            </a>
                            <a href="#unread"
                                className={"NotificationTypesCell ".concat(
                                    (window.location.hash == "#unread") && (
                                        "active"
                                    )
                                )}>
                                Unread
                            </a>
                        </div>
                    </div>

                    <br />

                    {/* display if there are notifications in list */}
                    {this.state.notifications.length > 0 ? (
                        <div>
                            <div className="page-buttons">
                                {this.state.pageButtons}
                            </div>
                            <div className="NotificationList">
                                {/* loop through to list out the notifications */}
                                {this.state.notifications.map((notification, index) => (
                                    <div key={index} className={notification.read ? "NotificationItem NotificationRead" : "NotificationItem NotificationUnread"}>
                                        <div className="NotificationImageContainer">
                                            {notification.type == "trade" && (
                                                <img className="NotificationImage" src={logo} />
                                            )}
                                            {notification.type == "system" && (
                                                <img className="NotificationImage" src={logo} />
                                            )}
                                        </div>

                                        <div className="NotificationMessage">
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: DOMPurify.sanitize(notification.message.split(".")[0])
                                                }}
                                            />
                                            <div className="NotificationDate">{formatDate(notification.createdAt)}</div>
                                        </div>

                                        <div className="NotificationButtonContainer">
                                            {notification.type == "trade" && (
                                                <Link to={notification.url}>
                                                    <button className="NotificationButton">
                                                        Check trade details
                                                    </button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        // no notifications, display text
                        <div style={{ padding: '1em 2em', textAlign: 'center' }}>
                            <h2>{this.state.message}</h2>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}