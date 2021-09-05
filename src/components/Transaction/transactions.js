import React, { Component } from "react";

import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";
import TransactionService from "../../services/transaction.service";

import socket from '../../services/socket';

export default class Transactions extends Component {
    constructor(props) {
        super(props);
        this.state = { transactions: [] };
    }

    load = () => {
        this.setState({ transactions: [] });
        TransactionService.getTransactionsByBuyer(
            AuthService.getCurrentUser().id
        ).then(response => {
            this.setState({ transactions: response.data });
        }).catch(function (error) {
            console.log(error);
        })
    }

    componentDidMount() {
        this.load();
    }

    cancelTransaction = (transaction) => {
        if (window.confirm("Are you sure you want to request for transaction cancellation?")) {
            const sender = {
                id: AuthService.getCurrentUser().id,
                username: AuthService.getCurrentUser().username
            };

            let receiverId = null;
            if (AuthService.getCurrentUser().id == transaction.user_seller._id) {
                receiverId = transaction.user_buyer._id
            } else if (AuthService.getCurrentUser().id == transaction.user_buyer._id) {
                receiverId = transaction.user_seller._id
            }
            const data = {
                type: "transaction",
                sender: sender.id,
                receiver: receiverId,
                url: `/transaction/${transaction._id}`,
                message: `User ${sender.username} has requested for a transaction cancellation. Click here for more information.`
            };

            socket.emit("notifyCancelTransaction", data);

            UserService.addNotification(
                transaction.user_seller._id, data
            ).then(
                (response) => {

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

            // TransactionService.cancelTransaction(
            //     transaction.item._id,
            //     AuthService.getCurrentUser().id
            // ).then(
            //     () => {
            //         this.load();
            //     },
            //     error => {
            //         const resMessage =
            //             (error.response &&
            //                 error.response.data &&
            //                 error.response.data.message) ||
            //             error.message ||
            //             error.toString();

            //         console.log(resMessage);
            //     }
            // );

        }
    }

    render() {
        return (
            <div>
                <div className="container">
                    <h1>Transactions</h1>
                    <br />
                    <h2>Ongoing</h2>
                    {this.state.transactions.map((transaction, index) =>
                        transaction.status === "Pending" &&
                        <div>
                            <div style={{ width: '40em', height: '10em', marginTop: '2em' }}>
                                    <a key={index} href={"transaction/" + transaction._id}>
                                    <div className="ItemPanel">
                                        {/* {transaction.item.images.map(image =>
                                    image.cover && (
                                        <img src={process.env.REACT_APP_NODEJS_URL.concat("images/", image.name)} alt={image.name} />
                                    )
                                )} */}
                                        <h4>{transaction.item.name} for {transaction.item.forItemName}</h4>
                                    </div>
                                </a>
                            </div>
                            <button onClick={() => this.cancelTransaction(transaction)}>Cancel transaction</button>
                        </div>
                    )}
                    <br />
                    <br />
                    <br />
                    <br />
                    <h2>Cancelled</h2>
                    {this.state.transactions.map((transaction, index) =>
                        transaction.status === "Cancelled" && (
                            <div style={{ width: '40em', height: '10em', marginTop: '2em' }}>
                                {transaction.item ? (
                                    <a key={index} href={"transaction/" + transaction._id}>
                                        <div className="ItemPanel">
                                            <h4>{transaction.item.name} for {transaction.item.forItemName}</h4>
                                        </div>
                                    </a>
                                ) : (
                                    <div className="ItemPanel">
                                        <h4>(Item removed by trader)</h4>
                                    </div>
                                )}
                            </div>
                        )
                    )}
                    <br />
                    <br />
                    <br />
                    <br />
                    <h2>Expired</h2>
                    {this.state.transactions.map((transaction, index) =>
                        transaction.status === "Expired" && (
                            <div style={{ width: '40em', height: '10em', marginTop: '2em' }}>
                                {transaction.item ? (
                                    <a key={index} href={"transaction/" + transaction._id}>
                                        <div className="ItemPanel">
                                            <h4>{transaction.item.name} for {transaction.item.forItemName}</h4>
                                        </div>
                                    </a>
                                ) : (
                                    <div className="ItemPanel">
                                        <h4>(Item removed by trader)</h4>
                                    </div>
                                )}
                            </div>
                        )
                    )}
                </div>
            </div>
        );
    }
}