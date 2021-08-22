import React, { Component } from "react";
import { Link } from "react-router-dom";

import AuthService from "./services/auth.service";

import NavigationBar from "./NavigationBar";

export default class Cart extends Component {
    constructor(props) {
        super(props);
        this.state = { cart: [] };
    }

    componentDidMount() {
        AuthService.viewOneUser(AuthService.getCurrentUser().id).then(response => {
            const temp = response.data.cart;
            const cart = [];
            temp.map(itemid => {
                AuthService.viewOneItem(itemid).then(response => {
                    cart.push(response.data)
                    this.setState({ cart: cart });
                });
            });
        }).catch(function (error) {
            console.log(error);
        })
    }

    render() {
        console.log(this.state.cart);
        return (
            <div>
                <NavigationBar />
                <div className="container">
                    <h1>Cart</h1>
                    {this.state.cart.map(item =>
                        <a href={"item/" + item._id}>
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