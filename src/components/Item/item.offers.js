import React, { Component } from "react";
import { Link } from "react-router-dom";

import ItemService from "../../services/item.service";
import '../../css/ItemMenu.css';

export default class Offers extends Component {
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
                <div className="title">
                    Popular Offers
                    <Link id="more" to="/popular?page=1">
                        {"More >>"}
                    </Link>
                </div>
                <hr className="section-line" />
                <div className="menu">
                    {this.state.items.map((item, index) =>
                        <Link className="item-box" key={index} to={"/item/" + item._id}>
                            <div className="item-box-img">
                                {item.images.map(image =>
                                    image.cover && (
                                        <img src={process.env.REACT_APP_NODEJS_URL.concat("images/", image.name)} />
                                    )
                                )}
                            </div>
                            <div className="item-info">
                                {item.name} / <b>{item.quantity}</b>
                                <p className="for">FOR</p>
                                <p>{item.forItemName} / <b>{item.forItemQty}</b></p>
                                <p><b>Offers</b>: {item.offers}</p>
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        )
    }
}