import React, { Component } from "react";

import ItemService from "../services/item.service";
import { Helmet } from "react-helmet";

import Categories from "./ItemCategory/Categories.js"
import Offers from "./Item/item.offers";

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = { items: [] };
    }

    loadItems = () => {
        ItemService.getItemsByTransaction("-offers")
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
            <div className="page-container">
                <Helmet>
                    <title>No Name Food Trading</title>
                </Helmet>
                <Categories />
                <Offers />
            </div>
        );
    }
}