import React, { Component } from "react";

import AuthService from "./services/auth.service";

import NavigationBar from "./NavigationBar";

export default class Cart extends Component {
    constructor(props) {
        super(props);
        this.state = { cart: [] };
    }

    load = () => {
        this.setState({ cart: [] });
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

    componentDidMount() {
        this.load();
    }
    
    removeFromCart = (itemid) => {
        if (window.confirm("Are you sure you want to remove item " + itemid + " from cart?")) {
            AuthService.deleteItemFromCart(
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
                    <h1>Cart</h1>
                    {this.state.cart.map(item =>
                        <div>
                            <div style={{ width: '40em', height: '10em', marginTop: '2em' }}>
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
                            </div>
                            <button onClick={() => this.removeFromCart(item._id)}>Remove from cart</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}