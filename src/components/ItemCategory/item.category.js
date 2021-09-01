import { React, Component } from 'react';

import AuthService from "../../services/auth.service";
import ItemService from "../../services/item.service";

import { CategoryList } from './item-categories.js';

export default class ItemCategory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            category: "",
            items: []
        };
    }

    componentDidMount() {
        const queryParams = new URLSearchParams(window.location.search);
        let category = queryParams.get('category');

        CategoryList.map(c => {
            if (category == c.url) {
                category = c.title;
                this.setState({ category: c.title });
            }
        });

        ItemService.getItemsByCategory(category)
            .then(response => {
                console.log(response.data);
                this.setState({ items: response.data });
            }).catch(function (error) {
                console.log(error);
            })
    }

    render() {
        return (
            <div className="container">
                <h2>{this.state.category}</h2>
                <hr className="section-line" />
                <br />
                {this.state.items.length > 0
                    ? this.state.items.map((item, index) => (
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
                    )) : (
                        <div>
                            <h2 style={{ textAlign: "center" }}>No items found.</h2>
                        </div>
                    )}
            </div>
        )
    }
}