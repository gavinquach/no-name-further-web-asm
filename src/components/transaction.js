import React, { Component } from "react";

import AuthService from "../services/auth.service";
import TransactionService from "../services/transaction.service";


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

    cancelTransaction = (itemid) => {
        if (window.confirm("Are you sure you want to cancel transaction?")) {
            TransactionService.cancelTransaction(
                itemid,
                AuthService.getCurrentUser().id
            ).then(
                response => {
                    this.load();
                },
                error => {
                    const resMessage =
                        (error.response &&
                            error.response.data &&
                            error.response.data.message) ||
                        error.message ||
                        error.toString();

                    // console.log(resMessage);
                }
            );
        }
    }

    render() {
        return (
            <div className="page-container">
                <div className="title">Transactions</div>
                <hr className="section-line" />
                    <h2>Ongoing</h2>
                    {this.state.transactions.map((transaction, index) =>
                        transaction.status === "Pending" &&
                        <div>
                            <div style={{ width: '40em', height: '10em', marginTop: '2em' }}>
                                <a key={index} href={"item/" + transaction.item._id}>
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
                            <button onClick={() => this.cancelTransaction(transaction.item._id)}>Cancel transaction</button>
                        </div>
                    )}

                    <h2>Cancelled</h2>
                    {this.state.transactions.map((transaction, index) =>
                        transaction.status === "Cancelled" && (
                            <div style={{ width: '40em', height: '10em', marginTop: '2em' }}>
                                {transaction.item ? (
                                    <a key={index} href={"item/" + transaction.item._id}>
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

                    <h2>Expired</h2>
                    {this.state.transactions.map((transaction, index) =>
                        transaction.status === "Expired" && (
                            <div style={{ width: '40em', height: '10em', marginTop: '2em' }}>
                                {transaction.item ? (
                                    <a key={index} href={"item/" + transaction.item._id}>
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
        );
    }
}