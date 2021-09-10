import React, { Component } from "react";

import AuthService from "../../services/auth.service";
import ItemService from "../../services/item.service";
import TransactionService from "../../services/transaction.service";

import "../../css/TradeDetails.css"
import { Link } from "react-router-dom";

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

export default class Transactions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            transaction: null,
            item: null
        };
    }

    load = () => {
        TransactionService.getTransaction(
            this.props.match.params.id
        ).then(response => {
            // checks if user is either seller or buyer
            if (AuthService.getCurrentUser().id != response.data.user_buyer._id && AuthService.getCurrentUser().id != response.data.user_seller._id) {
                this.props.history.push("/");
            }
            ItemService.viewOneItem(
                response.data.item._id
            ).then(res => {
                this.setState({ transaction: response.data, item: res.data });
            }).catch((err) => {
                console.log(err);
            });

        }).catch((error) => {
            // error produced (either id is invalid, or
            // something went wrong while getting transaction),
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
        this.load();
    }

    requestCancel = (transaction) => {
        if (window.confirm("Are you sure you want to request for trade cancellation?")) {
            TransactionService.cancelTransactionWithNotification(
                transaction
            ).then(
                () => {
                    this.load();
                },
                error => {
                    const resMessage =
                        (error.response &&
                            error.response.data &&
                            error.response.data.message) ||
                        error.message ||
                        error.toString();

                    console.log(resMessage);
                }
            );

        }
    }

    render() {
        const transaction = this.state.transaction && this.state.transaction;
        const item = this.state.item && this.state.item;
        return (
            <div className="container">
                <h1>Trade Details</h1>
                <br />
                {(transaction && item) && (
                    <div className="TradeDetails">
                        <p>ID: {transaction._id}</p>
                        <p>Trader: {transaction.user_buyer.username}</p>
                        <p>Owner: {transaction.user_seller.username}</p>
                        <Link to={"/item/" + item._id} className="ItemPanel">
                            {item.images.map(image =>
                                image.cover && (
                                    <img className="ItemImage" src={process.env.REACT_APP_NODEJS_URL.concat("images/", image.name)} />
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
                        <p>Trade status: {transaction.status}</p>
                        <p>Trade creation date: {formatDate(transaction.creation_date)}</p>
                        <p>Trade expiration date: {formatDate(transaction.expiration_date)}</p>
                        <br />
                        <button className="TradeButton" onClick={() => this.requestCancel(transaction)}>Request trade cancellation</button>
                        <button className="TradeButton" onClick={() => { }}>Chat with owner</button>
                    </div>
                )}
            </div>
        );
    }
}