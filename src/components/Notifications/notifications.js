import React, { Component } from 'react';
import DOMPurify from 'dompurify';

import logo from '../../images/lazyslob-logo.png';
import '../../css/Notifications.css';

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

export default class Notifications extends Component {
    constructor(props) {
        super(props);
        this.state = {
            notifications: [],
            message: "You have no notifications."
        };
    }

    load = () => {
        // get hash value in URL
        const hash = window.location.hash.replace("#", "");
        UserService.getUserNotifications(
            AuthService.getCurrentUser().id
        ).then(response => {
            if (hash == "unread") {
                // create array for all unread notifications
                const list = [];
                response.data.map(notification => {
                    !notification.read && list.push(notification);
                });

                this.setState({
                    notifications: list,
                    message: "No unread notifications."
                });
            }

            // system notifications
            else if (hash == "system") {
                // create array for all unread notifications
                const list = [];
                response.data.map(notification => {
                    notification.type == "system" && list.push(notification);
                });

                this.setState({
                    notifications: list,
                    message: "You have no system notifications."
                });
            }

            // trade notifications
            else if (hash == "trade") {
                // create array for all unread notifications
                const list = [];
                response.data.map(notification => {
                    notification.type == "trade" && list.push(notification);
                });

                this.setState({
                    notifications: list,
                    message: "You have no trade notifications."
                });
            }

            // all notifications
            else {
                this.setState({
                    notifications: response.data,
                    message: "You have no notifications."
                });
            }
        }).catch(function (error) {
            console.log(error);
        })
    }

    componentDidMount() {
        this.load();

        // get hash value in URL
        const hash = window.location.hash.replace("#", "");
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
            // get hash value in URL
            const hash = window.location.hash.replace("#", "");
            console.log(hash);

            UserService.getUserNotifications(AuthService.getCurrentUser().id)
                .then(
                    response => {
                        if (hash == "unread") {
                            // create array for all unread notifications
                            const list = [];
                            response.data.map(notification => {
                                !notification.read && list.push(notification);
                            });

                            this.setState({
                                notifications: list,
                                message: "No unread notifications."
                            });
                        }

                        // system notifications
                        else if (hash == "system") {
                            // create array for all unread notifications
                            const list = [];
                            response.data.map(notification => {
                                notification.type == "system" && list.push(notification);
                            });

                            this.setState({
                                notifications: list,
                                message: "You have no system notifications."
                            });
                        }

                        // trade notifications
                        else if (hash == "trade") {
                            // create array for all unread notifications
                            const list = [];
                            response.data.map(notification => {
                                notification.type == "trade" && list.push(notification);
                            });

                            this.setState({
                                notifications: list,
                                message: "You have no trade notifications."
                            });
                        }

                        // all notifications
                        else {
                            this.setState({
                                notifications: response.data,
                                message: "You have no notifications."
                            });
                        }
                    })
                .catch((error) => {
                    console.log(error);
                });
        }, 100);
    }

    render() {
        return (
            <div align="center">
                <br />
                <h1>Notifications</h1>
                <br />
                <div>
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
                            <a href="#unread"
                                className={"NotificationTypesCell ".concat(
                                    (window.location.hash == "#unread") && (
                                        "active"
                                    )
                                )}>
                                Unread
                            </a>
                            <a href="#trade"
                                className={"NotificationTypesCell ".concat(
                                    (window.location.hash == "#trade") && (
                                        "active"
                                    )
                                )}>
                                Trade
                            </a>
                        </div>
                    </div>

                    <br />

                    {/* display if there are notifications in list */}
                    {this.state.notifications.length > 0 ? (
                        <div style={{ width: '60em', borderTop: '1px solid' }}>
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
                                            <a href={notification.url}>
                                                <button className="NotificationButton">
                                                    Check trade details
                                                </button>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // no notifications, display text
                        <div style={{ padding: '1em 2em', textAlign: 'center' }}>
                            <h2>{this.state.message}</h2>
                        </div>
                    )}
                </div>
                <div style={{ marginBottom: '10em' }} />
            </div>
        );
    }
}