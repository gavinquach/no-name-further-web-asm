import React, { Component } from "react";

import AuthService from "../services/auth.service";
import ItemService from "../services/item.service";

<<<<<<< Updated upstream
import ItemTypes from "./ItemType/item.type.js"

=======
import Categories from "./ItemCategory/Categories.js"
import Offers from "./Item/item.offers";
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
               
                <div className="container">
                    <ItemTypes/>
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
                                                <img src={process.env.REACT_APP_NODEJS_URL.concat("images/", image.name)}/>
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
                                            <img src={process.env.REACT_APP_NODEJS_URL.concat("images/", image.name)}/>
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
=======
                <div className="page-container">
                    <Categories />
                    <Offers/>
>>>>>>> Stashed changes
                </div>
            </div>
        );
    }
}