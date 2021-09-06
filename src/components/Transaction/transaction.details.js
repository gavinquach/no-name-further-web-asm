import React, { Component } from "react";

import AuthService from "../../services/auth.service";
import TransactionService from "../../services/transaction.service";

// format the date to be readable from Date object
const formatDate = (d) => {
    const dateObj = new Date(d);
    const date = ("0" + dateObj.getDate()).slice(-2);   // add leading 0 to date
    const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);   // add leading 0 to month
    const year = dateObj.getFullYear();
    const hour = ("0" + dateObj.getHours()).slice(-2);   // add leading 0 to hour
    const minute = ("0" + (dateObj.getMinutes())).slice(-2);   // add leading 0 to minute
    const second = dateObj.getSeconds();

    // ===============================================
    // commented out because Date object automatically
    // adjust to current client time zone
    // ===============================================
    // // calculate time zone
    // const timeZoneOffset = dateObj.getTimezoneOffset();
    // let timeZone = timeZoneOffset / 60;
    // if (timeZone < 0) {
    //     timeZone = Math.abs(timeZone);
    // } else {
    //     timeZone = -Math.abs(timeZone);
    // }
    // // get final hour value
    // hour = ("0" + (hour + timeZone)).slice(-2); // add leading 0 to hour

    return `${date}/${month}/${year} at ${hour}:${minute}:${second}`;
}

export default class Transactions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            transaction: null
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
            this.setState({ transaction: response.data });
        }).catch((error) => {
            // error produced (either id is invalid, or
            // something went wrong while getting transaction),
            // redirect to home page
            this.props.history.push("/");
            console.log(error);
        });
    }

    componentDidMount() {
        this.load();
    }

    cancelTransaction = (transaction) => {
        if (window.confirm("Are you sure you want to request for transaction cancellation?")) {
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
        return (
            <div className="container">
                <h1>Transaction Details</h1>
                {this.state.transaction && (
                    <div>
                        <div>ID: {this.state.transaction._id}</div>
                        <div>Trader: {this.state.transaction.user_buyer.username}</div>
                        <div>Owner: {this.state.transaction.user_seller.username}</div>
                        <div>Item name: {this.state.transaction.item.name}</div>
                        <div>Trade for item: {this.state.transaction.item.forItemName}</div>
                        <div>Transaction status: {this.state.transaction.status}</div>
                        <div>Creation date: {formatDate(this.state.transaction.creation_date)}</div>
                        <div>Expiration date: {formatDate(this.state.transaction.expiration_date)}</div>
                        <button onClick={() => this.cancelTransaction(this.state.transaction)}>Cancel transaction</button>
                    </div>
                )}
            </div>
        );
    }
}