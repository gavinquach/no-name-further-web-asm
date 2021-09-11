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
        }).catch(function (error) {
            console.log(error);
        })
    }

    componentDidMount() {
        this.load();
    }

    removeFromCart = (itemid) => {
        if (window.confirm("Are you sure you want to remove item " + itemid + " from cart?")) {
            UserService.deleteItemFromCart(
                AuthService.getCurrentUser().id,
                itemid
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
                }
            );
        }
    }

    renderHTML() {
        if (this.state.cart) {
            return this.state.cart.map((item, index) => {
                return (
                    <div key={index} className="cart-item" >
                        <div className="cart-row">
                            <Link to={"/item/" + item._id}>
                                <div className="ItemPanel">
                                    {item.images.map((image, index) => {
                                        return (
                                            image.cover && (<img key={index} className="d-block w-50 h-50" src="https://cdn.tgdd.vn/2020/10/CookProduct/Sushi-la-gi-co-tot-khong-nhung-loai-sushi-tot-va-khong-tot-cho-suc-khoe-1-1200x676.jpg" alt={image.name} />)
                                        )
                                    })}
                                    <h4 className="text-cart">{item.name} for {item.forItemName}</h4>
                                </div>
                            </Link>
                        </div>
                        <button className="btn btn-danger remove-cart" onClick={() => this.removeFromCart(item._id)}>Remove</button>
                    </div>
                )
            })
        }
    }

    render() {
        console.log(this.state)
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