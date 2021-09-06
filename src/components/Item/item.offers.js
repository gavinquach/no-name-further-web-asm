import React, { Component } from "react";

import ItemService from "../../services/item.service";
import '../../css/ItemMenu.css';

export default class Offers extends Component {
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
            <div>
             <div className = "title">Popular Offers
                        <a id="more" href="/popular?page=1">
                            {"More >>"}
                        </a>
                    </div>
                    <hr className="section-line" />
            <div className="menu white-container">
                 {this.state.items.map((item, index) =>
                        <a className="item-box" key={index} href={"item/" + item._id}>
                                <div className="item-box-img">
                                    {item.images.map(image =>
                                        image.cover && (
                                            <img src={process.env.REACT_APP_NODEJS_URL.concat("images/", image.name)} />
                                        )
                                    )}
                                </div>
                                <div className = "item-info">
                                    {item.name} / <b>{item.quantity}</b>
                                    <p className="for">FOR</p>
                                    <p>{item.forItemName} / <b>{item.forItemQty}</b></p>
                                    <p><b>Offers</b>: {item.offers}</p>
                                </div>
                          
                        </a>
                    )}
            </div>
        </div>
        )
    }
}