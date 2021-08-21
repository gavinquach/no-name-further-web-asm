import React, { Component } from "react";
import { Link } from "react-router-dom";

import AuthService from "./services/auth.service";

import NavigationBar from "./NavigationBar";

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = { items: [] };
    }

    load = () => {
        AuthService.viewAllItems().then(response => {
            // console.log(response.data);
            this.setState({ items: response.data }, () => console.log(this.state.items));
        }).catch(function (error) {
            console.log(error);
        })
    }

    componentDidMount() {
        this.load();
    }

    render() {
        return (
            <div>
                <NavigationBar />
                <div className="container">
                    <h1>Hello</h1>
                    {this.state.items.map(item =>
                        <a href={"item/" + item._id}>
                            <div className="ItemPanel">
                                {item.images.map(image =>
                                    image.cover && (
                                        <img src={Buffer.from(image.data_url).toString('utf8')} alt={image.name} />
                                    )
                                )}
                                <h4>{item.name} for {item.forItemName}</h4>
                            </div>
                        </a>
                    )}
                </div>
            </div >
        );
    }
}