import React, { Component } from "react";

import AuthService from "../services/auth.service";
import UserService from "../services/user.service";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import "../css/Cart.css";

export default class Cart extends Component {
    constructor(props) {
        super(props);
        this.state = { cart: [] };
    }

    load = () => {
        this.setState({ cart: [] });
        UserService.viewUserCart(AuthService.getCurrentUser().id).then(response => {
            this.setState({ cart: response.data });
        }).catch((error) => {
            if (error.response && error.response.status != 500) {
                console.log(error.response.data.message);
            } else {
                console.log(error);
            }
        })
    }

    componentDidMount() {
        this.load();
    }

    removeFromCart = (itemid) => {
        UserService.deleteItemFromCart(
            AuthService.getCurrentUser().id,
            itemid
        ).then(() => {
            this.load();
        }).catch((error) => {
            if (error.response && error.response.status != 500) {
                console.log(error.response.data.message);
            } else {
                console.log(error);
            }
        });
    }

    renderHTML() {
        if (this.state.cart) {
            return this.state.cart.map((item, index) => {
                return (
                    <div key={index} className="cart-item" >
                        <div className="ItemSection">
                            <Link to={"/item/" + item._id} className="ItemPanel">
                                <div>
                                    {item.images.map((image, index) => {
                                        return (
                                            image.cover && (<img key={index} className="CartItemImage" src={process.env.REACT_APP_NODEJS_URL.concat("images/", image.name)} alt={image.name} />)
                                        )
                                    })}
                                </div>
                                <div>
                                    <h4 className="HeaderText">{item.name} for {item.forItemName}</h4>
                                    <div className="Details">
                                        <p>Quantity: {item.quantity}</p>
                                        <p>{item.forItemName}'s quantity: {item.forItemQty}</p>
                                        <p><b>Offers</b>: {item.offers}</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <button className="btn btn-danger RemoveBtn" onClick={() => this.removeFromCart(item._id)}>Remove</button>
                    </div>
                )
            });
        }
    }

    render() {
        if (AuthService.isRootAccount()) {
            return (
                <div className="page-container">
                    <Helmet>
                        <title>Cart</title>
                    </Helmet>
                    <div className="title">Cart</div>
                    <hr className="section-line" />
                    <div className="white-container">
                        <h2>Root account can't add items to cart.</h2>
                    </div>
                </div >
            );
        }
        return (
            <div className="page-container">
                <Helmet>
                    <title>Cart</title>
                </Helmet>
                <div className="title">Cart</div>
                <hr className="section-line" />
                <div className="white-container">
                    {this.renderHTML()}
                </div>
            </div >
        );
    }
}