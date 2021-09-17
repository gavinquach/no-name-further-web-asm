import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

import AuthService from "../../services/auth.service";
import ItemService from "../../services/item.service";
import TradeService from "../../services/trade.service";
import socket from '../../services/socket';

import "../../css/TradeDetails.css"

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

export default class TradeDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            trade: null,
            item: null
        };
    }

    load = () => {
        TradeService.getTrade(
            this.props.match.params.id
        ).then(response => {
            if (response.data.user_buyer && response.data.user_seller) {
                // checks if user is either seller or buyer
                if (AuthService.getCurrentUser().id != response.data.user_buyer._id && AuthService.getCurrentUser().id != response.data.user_seller._id) {
                    this.props.history.push("/");
                }
            }
            ItemService.viewOneItem(
                response.data.item._id
            ).then(res => {
                this.setState({ trade: response.data, item: res.data });
            }).catch((err) => {
                if (err.response && err.response.status != 500) {
                    console.log(err.response.data.message);
                } else {
                    console.log(err);
                }
            });
        }).catch((error) => {
            // error produced (either id is invalid, or
            // something went wrong while getting trade),
            // redirect to home page
            this.props.history.push("/");
            if (error.response && error.response.status != 500) {
                console.log(error.response.data.message);
            } else {
                console.log(error);
            }
        });
    }

    componentDidMount() {
        window.scrollTo(0, 0); // automatically scroll to top
        this.load();
    }

    cancelTrade = (trade) => {
        if (window.confirm("Are you sure you want to cancel trade?")) {
            TradeService.cancelTradeWithNotification(
                trade
            ).then(() => {
                this.load();
            }).catch((error) => {
                if (error.response && error.response.status != 500) {
                    console.log(error.response.data.message);
                } else {
                    console.log(error);
                }
            });
        }
    }

    chatWithUser = (trade) => {
        const data = {
            user: AuthService.getCurrentUser().id,
            receiver: trade.user_seller._id == AuthService.getCurrentUser().id ? trade.user_buyer._id : trade.user_seller._id,
            trade: trade
        };
        socket.emit("chatWithUserRequest", data);
    }

    approveTrade = (trade) => {
        if (window.confirm("Approve trade?")) {
            TradeService.approveTrade(
                trade,
                AuthService.getCurrentUser().id
            ).then(() => {
                this.load();
            }).catch((error) => {
                if (error.response && error.response.status != 500) {
                    console.log(error.response.data.message);
                } else {
                    console.log(error);
                }
            });
        }
    }

    denyTrade = (trade) => {
        if (window.confirm("Deny trade?")) {
            TradeService.denyTrade(
                trade,
                AuthService.getCurrentUser().id
            ).then(() => {
                this.load();
            }).catch((error) => {
                if (error.response && error.response.status != 500) {
                    console.log(error.response.data.message);
                } else {
                    console.log(error);
                }
            });
        }
    }

    render() {
        const status = {
            PENDING: "Ongoing",
            WAITING_APPROVAL: "Waiting approval from owner",
            DENIED: "Request denied by owner",
            CANCELLED: "Cancelled",
            EXPIRED: "Expired"
        }
        const trade = this.state.trade && this.state.trade;
        const item = this.state.item && this.state.item;
        return (
            <div className="page-container">
                <Helmet>
                    <title>Trade Details</title>
                </Helmet>
                <div className="title">Trade Details</div>
                <hr className="section-line" />
                <br />
                {(trade && item) && (
                    <div className="TradeDetails">
                        <p>ID: {trade._id}</p>
                        <p>
                            {trade.status == "WAITING_APPROVAL"
                                ? "Request from: ".concat(trade.user_buyer ? trade.user_buyer.username : "N/A")
                                : "Trader: ".concat(trade.user_buyer ? trade.user_buyer.username : "N/A")}
                        </p>
                        <p>Owner: {trade.user_seller.username}</p>
                        {trade.user_seller._id != AuthService.getCurrentUser().id ? (
                            <Link to={"/trader/" + item.seller.username}>
                                <button style={{
                                    marginTop: '0em',
                                    marginBottom: '1em',
                                    marginLeft: '0em',
                                    marginRight: '-1.5em'
                                }} className="VisitUserPageBtn"
                                >
                                    Visit {item.seller.username}'s' page
                                </button>
                            </Link>
                        ) : (
                            <Link to={trade.user_buyer ? "/trader/" + trade.user_buyer.username : "#"}>
                                <button style={{
                                    marginTop: '0em',
                                    marginBottom: '1em',
                                    marginLeft: '0em',
                                    marginRight: '-1.5em'
                                }} className="VisitUserPageBtn"
                                >
                                    Visit {trade.user_buyer ? trade.user_buyer.username : "N/A"}'s' page
                                </button>
                            </Link>
                        )}
                        <button className="ChatWithUser" onClick={() => this.chatWithUser(trade)}>Chat with user</button>

                        <br /><br />
                        <Link to={"/item/" + item._id} className="ItemPanel">
                            {item.images.map((image, index) =>
                                image.cover && (
                                    <img key={index + "-img"} className="ItemImage" src={process.env.REACT_APP_NODEJS_URL.concat("images/", image.name)} />
                                )
                            )}
                            <div className="ItemDetails">
                                <h3 style={{ textAlign: 'center' }}><b>{item.name}</b></h3>
                                <hr style={{ border: '1px solid black' }} />
                                <h5>Type: <b>{item.type.name}</b></h5>
                                <h5>Quantity: <b>{item.quantity}</b></h5>
                            </div>
                            <h3>for</h3>
                            <div className="ItemDetails">
                                <h3 style={{ textAlign: 'center' }}><b>{item.forItemName}</b></h3>
                                <hr style={{ border: '1px solid black' }} />
                                <h5>Type: <b>{item.forItemType.name}</b></h5>
                                <h5>Quantity: <b>{item.forItemQty}</b></h5>
                            </div>
                        </Link>

                        <p>Trade status: <b>
                            {trade.status == "CANCELLED" ? (
                                `Cancelled by ${trade.cancel_user && trade.cancel_user.username}`
                            ) : (
                                status[trade.status]
                            )
                            }</b></p>

                        {(trade.status == "WAITING_APPROVAL" || trade.status == "PENDING") && (
                            <span>
                                <p>Trade creation date: {formatDate(trade.createdAt)}</p>
                                <p>Trade expiration date: {formatDate(trade.expiration_date)}</p>
                            </span>
                        )}
                        <br />

                        {/* trade status is WAITING_APPROVAL and user is item owner */}
                        {(trade.status == "WAITING_APPROVAL" && trade.user_seller._id == AuthService.getCurrentUser().id) && (
                            <span>
                                <button className="TradeButton ApproveTrade" onClick={() => this.approveTrade(trade)}>Approve trade request</button>
                                <button className="TradeButton DenyTrade" onClick={() => this.denyTrade(trade)}>Deny trade request</button>
                            </span>
                        )}
                        {trade.status == "PENDING" && (
                            <button className="TradeButton CancelTrade" onClick={() => this.cancelTrade(trade)}>Cancel trade</button>
                        )}
                    </div>
                )}
            </div>
        );
    }
}