import React, { Component } from "react";

import AuthService from "../services/auth.service";
import ItemService from "../services/item.service";

import ItemCategories from "./ItemType/item.category.js"


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
                <div className="container">
                    <h2>Categories</h2>
                    <hr className="section-line" />
                    <br />
                    <ItemCategories />
                    <br />
                    <br />

                    <h2>Popular offers</h2>
                    <hr className="section-line" />
                    <br />
                    {/* if is logged in then show listings from other people, hide ones that belong to current user */}
                    <div className="main-section">
                        {AuthService.isLoggedIn() && this.state.items.map((item, index) =>
                            (item.seller != AuthService.getCurrentUser().id) &&
                            <a key={index} href={"item/" + item._id}>
                                <div className="Dashboard">
                                    <div className="Dashboard-img">
                                        {item.images.map(image =>
                                            image.cover && (
                                                <img src={process.env.REACT_APP_NODEJS_URL.concat("images/", image.name)} />
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
                            <div className="Dashboard">
                                <div className="Dashboard-img">
                                    {item.images.map(image =>
                                        image.cover && (
                                            <img src={process.env.REACT_APP_NODEJS_URL.concat("images/", image.name)} />
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