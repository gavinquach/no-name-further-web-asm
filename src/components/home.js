import React, { Component } from "react";
import { Helmet } from "react-helmet";

import Categories from "./ItemCategory/Categories.js"
import Offers from "./Item/item.offers";

export default class Home extends Component {
    constructor(props) {
        super(props);
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