import React, { Component } from "react";

import AuthService from "../services/auth.service";
import ItemService from "../services/item.service";


import ItemTypes from "./ItemType/item.type.js"

import Categories from "./ItemCategory/Categories.js"
import Offers from "./Item/item.offers";


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
 
                <div className="page-container">
                    <Categories />
                    <Offers/>

            </div>
        );
    }
}