import React, { Component } from "react";

import AuthService from "../services/auth.service";
import ItemService from "../services/item.service";

import Categories from "./ItemCategory/Categories.js"


export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = { items: [] };
    }

    loadItems = () => {
        ItemService.getMostOffersItems()
            .then(response => {
                this.setState({ items: response.data.items });
            }).catch(function (error) {
                console.log(error);
            })
    }

    componentDidMount() {
        this.loadItems();
    }

    render() {
        return (
            <div>
                <div className="container">
                    <h2>Categories</h2>
                    <hr className="section-line" />
                    <br />
                    <Categories />
                    <br />
                    <br />

                    <h2>Popular offers
                        <a style={{ fontSize: "20px", marginLeft: "2em" }} href="/popular?page=1">
                            {"more >>"}
                        </a>
                    </h2>
                    <hr className="section-line" />
                    <br />
                    {this.state.items.map((item, index) =>
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
                                <p>Offers: {item.offers}</p>
                            </div>
                        </a>
                    )}
                </div>
            </div>
        );
    }
}