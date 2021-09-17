import React, { Component } from "react";
import { Helmet } from "react-helmet";

import Categories from "./ItemCategory/Categories.js"
import Offers from "./Item/item.offers";

export default class Home extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        window.scrollTo(0, 0); // automatically scroll to top
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