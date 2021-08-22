import React, { Component } from "react";

import AuthService from "./services/auth.service";

import NavigationBar from "./NavigationBar";

export default class Transactions extends Component {
    constructor(props) {
        super(props);
        this.state = { transactions: [] };
    }

    componentDidMount() {
        AuthService.getTransactionsByBuyer(
            AuthService.getCurrentUser().id
        ).then(response => {
            this.setState({ transactions: response.data });
        }).catch(function (error) {
            console.log(error);
        })
    }

    render() {
        return (
            <div>
                <NavigationBar />
                <div className="container">
                    <h1>Transactions</h1>
                    {this.state.transactions.map((transc, index) =>
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
                    )}
                </div>
            </div>
        );
    }
}