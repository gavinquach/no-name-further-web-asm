import React, { Component } from "react";

import AuthService from "./services/auth.service";

import NavigationBar from "./NavigationBar";

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = { items: [] };
    }

    componentDidMount() {
        AuthService.viewAllItems().then(response => {
            // console.log(response.data);
            this.setState({ items: response.data });
        }).catch(function (error) {
            console.log(error);
        })
    }

    render() {
        return (
            <div>
                <NavigationBar />
                <div className="container">
                    <a href="cart">Cart</a>
                    <br />
                    <a href="transactions">Transactions</a>
                    <h1>All available listings</h1>
                    {/* if is logged in then show listings from other people, hide ones that belong to current user */}
                    {AuthService.isLoggedIn() && this.state.items.map((item, index) =>
                        (item.seller != AuthService.getCurrentUser().id) &&
                        <a key={index} href={"item/" + item._id}>
                            <div className="ItemPanel">
                                {item.images.map(image =>
                                    image.cover && (
                                        <img src={Buffer.from(image.data_url).toString('utf8')} alt={image.name} />
                                    )
                                )}
                                <h4>{item.name} for {item.forItemName}</h4>
                            </div>
                        </a>
                    )}
                    {/* if not logged in, show all items */}
                    {!AuthService.isLoggedIn() && this.state.items.map((item, index) =>
                        <a key={index} href={"item/" + item._id}>
                            <div className="ItemPanel">
                                {item.images.map(image =>
                                    image.cover && (
                                        <img src={Buffer.from(image.data_url).toString('utf8')} alt={image.name} />
                                    )
                                )}
                                <h4>{item.name} for {item.forItemName}</h4>
                            </div>
                        </a>
                    )}
                </div>
            </div>
        );
    }
}