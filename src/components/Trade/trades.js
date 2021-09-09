import React, { Component } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import AuthService from "../../services/auth.service";
import TransactionService from "../../services/transaction.service";

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
        }).catch((error) => {
            if (error.response.status != 500) {
                console.log(error.response.data.message);
            } else {
                console.log(error);
            }
        })
    }

    componentDidMount() {
        this.load();
    }

    cancelTransaction = (transaction) => {
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
        return (
            <div className="page-container">
                <Helmet>
                    <title>Trades</title>
                </Helmet>
                <div className="title">Trades</div>
                <hr className="section-line" />
                <h2>Ongoing</h2>
                {this.state.transactions.map((transaction, index) =>
                    transaction.status === "Pending" &&
                    <div key={index + "-div1"} style={{ backgroundColor: 'lightgrey', width: '60em', height: '10em', marginBottom: '4em' }}>
                        <Link to={"/trade/" + transaction._id}>
                            <div key={index + "-ItemPanel"} className="ItemPanel" style={{ width: '60em', height: '10em' }}>
                                {/* {transaction.item.images.map(image =>
                                    image.cover && (
                                        <img src={process.env.REACT_APP_NODEJS_URL.concat("images/", image.name)} alt={image.name} />
                                    )
                                )} */}
                                <h4>{transaction.item.name} for {transaction.item.forItemName}</h4>
                            </div>
                        </Link>
                        <button onClick={() => this.cancelTransaction(transaction)}>Cancel transaction</button>
                    </div>
                )}

                <h2>Cancelled</h2>
                {this.state.transactions.map((transaction, index) =>
                    transaction.status === "Cancelled" && (
                        <div key={index + "-div2"} style={{ width: '40em', height: '10em', marginTop: '2em' }}>
                            {transaction.item ? (
                                <Link to={"/trade/" + transaction._id}>
                                    <div key={index + "-ItemPanel"} className="ItemPanel">
                                        <h4>{transaction.item.name} for {transaction.item.forItemName}</h4>
                                    </div>
                                </Link>
                            ) : (
                                <div className="ItemPanel">
                                    <h4>(Item removed by trader)</h4>
                                </div>
                            )}
                        </div>
                    )
                )}

                <h2>Expired</h2>
                {this.state.transactions.map((transaction, index) =>
                    transaction.status === "Expired" && (
                        <div key={index + "-div2"} style={{ width: '40em', height: '10em', marginTop: '2em' }}>
                            {transaction.item ? (
                                <Link to={"/trade/" + transaction._id}>
                                    <div key={index + "-ItemPanel"} className="ItemPanel">
                                        <h4>{transaction.item.name} for {transaction.item.forItemName}</h4>
                                    </div>
                                </Link>
                            ) : (
                                <div className="ItemPanel">
                                    <h4>(Item removed by trader)</h4>
                                </div>
                            )}
                        </div>
                    )
                )}
            </div>
        );
    }
}