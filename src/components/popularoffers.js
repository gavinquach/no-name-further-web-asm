import React, { Component } from "react";
import { Link } from "react-router-dom";

import ItemService from "../services/item.service";
import '../css/ItemCategories.css';
import '../css/ItemMenu.css'
import {Helmet} from "react-helmet";

export default class PopularOffers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: parseInt(new URLSearchParams(window.location.search).get('page')),
            totalPages: 0,
            results: 0,
            items: [],
            pageButtons: []
        };
    }

    // Replace a character at index with string replacement
    // Source: https://stackoverflow.com/a/1431113 (used with slight modifications)
    replaceAt = (str, index, replacement) => {
        return str.substr(0, index) + replacement + str.substr(index + replacement.length);
    }

    componentDidMount = () => {
        this.load();
    }

    load = () => {
        ItemService.getItemsByTransaction(
            "-offers",
            this.state.currentPage,
            9
        ).then(response => {
            this.setState({
                totalPages: response.data.totalPages,
                results: response.data.results,
                items: response.data.items
            }, () => this.loadPageButtons());
        }).catch(function (error) {
            console.log(error);
        });
    }

    updatePage = (page) => {
        this.setState({
            currentPage: page
        }, () => this.load());
    }

    loadPageButtons = () => {
        if (this.state.currentPage > this.state.totalPages) {
            return;
        }

        const url = new URL(window.location.href);
        const search_params = url.searchParams;

        const buttons = [];
        if (this.state.currentPage > 1) {
            const prevPage = this.state.currentPage - 1;
            search_params.set("page", prevPage);
            const pageURL = url.pathname + "?" + search_params.toString();

            buttons.push(
                <Link to={pageURL} onClick={() => this.updatePage(prevPage)}>
                    <button>Previous</button>
                </Link>
            );
        }
        for (let i = 1; i <= this.state.totalPages; i++) {
            // replace page number with index number
            search_params.set("page", i);
            const pageURL = url.pathname + "?" + search_params.toString();

            if (i === this.state.currentPage) {
                buttons.push(
                    <button disabled>{i}</button>
                )
            } else {
                buttons.push(
                    <Link style={{ textDecoration: 'none' }} to={pageURL} onClick={() => this.updatePage(i)}>
                        <div className="page-button" style={{ display: "inline", margin: '0px 8px' }}>{i}</div>
                    </Link>
                )
            }
        }
        if (this.state.currentPage < this.state.totalPages) {
            const nextPage = this.state.currentPage + 1;
            search_params.set("page", nextPage);
            const pageURL = url.pathname + "?" + search_params.toString();

            buttons.push(
                <Link to={pageURL} onClick={() => this.updatePage(nextPage)}>
                    <button>Next</button>
                </Link>
            );
        }
        this.setState({ pageButtons: buttons });
    }

    render() {
        // ========== validate GET parameters ==========
        const url = new URL(window.location.href);
        const search_params = url.searchParams;
        const page = search_params.get("page");
        if (!page || page === "") {
            search_params.set("page", 1);
            const pageURL = url.pathname + "?" + search_params.toString();
            return window.location.replace(pageURL);
        }
        // ========== end of GET param validation ==========
        return (
            <div className="page-container">
                <Helmet>
                    <title>Popular Offers</title>
                </Helmet>
                <div className="title">Popular Offers</div>
                <hr className="section-line" />
                <div className="menu white-container">
                    {this.state.items.length > 0
                        ? this.state.items.map((item, index) => (
                            <a className="item-box" key={index} href={"item/" + item._id}>
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
                            </a>
                        )) : (
                            <div>
                                <h2 style={{ textAlign: "center" }}>No items found.</h2>
                            </div>
                        )}
                     </div>
                    <div className="page-buttons">
                        {this.state.pageButtons}
                    </div>
               
            </div>
        )
    }
}