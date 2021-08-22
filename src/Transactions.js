import React, { Component } from "react";

import AuthService from "./services/auth.service";

import NavigationBar from "./NavigationBar";

export default class Transactions extends Component {
    constructor(props) {
        super(props);
        this.state = { transactions: [] };
    }

    load = () => {
        this.setState({ transactions: [] });
        AuthService.getTransactionsByBuyer(
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
            AuthService.cancelTransaction(
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
            <div>
                <NavigationBar />
                <div className="container">
                    <h1>Transactions</h1>
                    <br />
                    <h2>Ongoing</h2>
                    {this.state.transactions.map((transc, index) =>
                        transc.status === "Pending" &&
                        <div>
                            <div style={{ width: '40em', height: '10em', marginTop: '2em' }}>
                                <a key={index} href={"item/" + transc.item._id}>
                                    <div className="ItemPanel">
                                        {/* {transc.item.images.map(image =>
                                    image.cover && (
                                        <img src={Buffer.from(image.data_url).toString('utf8')} alt={image.name} />
                                    )
                                )} */}
                                        <h4>{transc.item.name} for {transc.item.forItemName}</h4>
                                    </div>
                                </a>
                            </div>
                            <button onClick={() => this.cancelTransaction(transc.item._id)}>Cancel transaction</button>
                        </div>
                    )}
                    <br />
                    <br />
                    <br />
                    <br />
                    <h2>Cancelled</h2>
                    {this.state.transactions.map((transc, index) =>
                        transc.status === "Cancelled" &&
                        <div style={{ width: '40em', height: '10em', marginTop: '2em' }}>
                            <a key={index} href={"item/" + transc.item._id}>
                                <div className="ItemPanel">
                                    {/* {transc.item.images.map(image =>
                                image.cover && (
                                    <img src={Buffer.from(image.data_url).toString('utf8')} alt={image.name} />
                                )
                            )} */}
                                    <h4>{transc.item.name} for {transc.item.forItemName}</h4>
                                </div>
                            </a>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}