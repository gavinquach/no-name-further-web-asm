import React, { Component } from "react";

import AuthService from "./services/auth.service";
import ItemService from "./services/item.service";

import NavigationBar from "./NavigationBar";

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = { items: [] };
    }

    componentDidMount() {
        ItemService.viewAllItems().then(response => {
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
                    <br />
                    <h3>All available listings</h3>
                    <br />
                    <br />
                    {/* if is logged in then show listings from other people, hide ones that belong to current user */}
            <div className="main-section"> 
                         {AuthService.isLoggedIn() && this.state.items.map((item, index) =>
                        (item.seller != AuthService.getCurrentUser().id) &&
                            <a key={index} href={"item/" + item._id}>
                                <div className="dashbord">
                                    <div className="dashbord-img">
                                            {item.images.map(image =>
                                                image.cover && (
                                                    <img src={process.env.REACT_APP_NODEJS_URL.concat("images/", image.name)} alt={image.name} />
                                                )
                                            )}
                                    </div>
                                            <p>{item.name} / <b>{item.quantity}</b></p>
                                            <p></p>
                                            <p className="for">For</p> 
                                            <p>{item.forItemName} / <b>{item.forItemQty}</b></p>
                                            <p></p>
                                </div>
                            </a>
                    )}
                            </div>

                    {/* if not logged in, show all items */}
                    {!AuthService.isLoggedIn() && this.state.items.map((item, index) =>
                            <a key={index} href={"item/" + item._id}>
                                <div className="dashbord">
                                    <div className="dashbord-img">
                                            {item.images.map(image =>
                                                image.cover && (
                                                    <img src={process.env.REACT_APP_NODEJS_URL.concat("images/", image.name)} alt={image.name} />
                                                )
                                            )}
                                    </div>
                                            <p>{item.name} / <b>{item.quantity}</b></p>
                                            <p></p>
                                            <p className="for">FOR</p> 
                                            <p>{item.forItemName} / <b>{item.forItemQty}</b></p>
                                            <p></p>
                                </div>
                            </a>
                    )}
                </div>
            </div>
        );
    }
}