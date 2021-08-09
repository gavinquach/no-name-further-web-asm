import React, { Component } from "react";
import { Link } from "react-router-dom";

import NavigationBar from "./NavigationBar";

export default class Home extends Component {
    render() {
        return (
            <div>
                <NavigationBar />
                <div className="container">
                    <header className="jumbotron">
                        <h3>Hello</h3>
                    </header>
                </div>
            </div>
        );
    }
}