import React, { Component } from "react";

import AuthService from "../services/auth.service";
import UserService from "../services/user.service";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";


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

                    // console.log(resMessage);
                }
            );
        }
    }

    render() {
        return (
            <div className="page-container">
                <Helmet>
                    <title>Cart</title>
                </Helmet>
                <div className="title">Cart</div>
                <hr className="section-line" />
                <div className="white-container">
                    {this.state.cart.map(item =>
                        <div>
                            <div style={{ width: '40em', height: '10em', marginTop: '2em' }}>
                                <Link to={"/item/" + item._id}>
                                    <div className="ItemPanel">
                                        {item.images.map(image =>
                                            image.cover && (
                                                <img src={process.env.REACT_APP_NODEJS_URL.concat("images/", image.name)} alt={image.name} />
                                            )
                                        )}
                                        <h4>{item.name} for {item.forItemName}</h4>
                                    </div>
                                </Link>
                            </div>
                            <button onClick={() => this.removeFromCart(item._id)}>Remove from cart</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}