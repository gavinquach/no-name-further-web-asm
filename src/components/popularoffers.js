import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import { Helmet } from "react-helmet";

import ItemService from "../services/item.service";
import '../css/ItemCategories.css';
import '../css/ItemMenu.css'

export default class PopularOffers extends Component {
    constructor(props) {
        super(props);
        this.widthChangeExecced = -1;
        this.resultLimit = 10;

        this.state = {
            currentPage: 1,
            totalPages: 0,
            results: 0,
            items: [],
            pageButtons: [],
            notfound: false
        };
    }

    // Replace a character at index with string replacement
    // Source: https://stackoverflow.com/a/1431113 (used with slight modifications)
    replaceAt = (str, index, replacement) => {
        return str.substr(0, index) + replacement + str.substr(index + replacement.length);
    }

    componentDidMount = () => {
        this.load();

        window.addEventListener('resize', () => {
            if (this.state.items.length > 0) {
                if (window.innerWidth > 1380) {
                    if (this.widthChangeExecced != 0) {
                        this.resultLimit = 15;
                        this.load();
                        this.widthChangeExecced = 0;
                    }
                } else if (window.innerWidth <= 1380 && window.innerWidth > 1090) {
                    if (this.widthChangeExecced != 1) {
                        this.resultLimit = 12;
                        this.load();
                        this.widthChangeExecced = 1;
                    }
                } else if (window.innerWidth <= 1090 && window.innerWidth > 830) {
                    if (this.widthChangeExecced != 2) {
                        this.resultLimit = 9;
                        this.load();
                        this.widthChangeExecced = 2;
                    }
                } else if (window.innerWidth <= 830) {
                    if (this.widthChangeExecced != 3) {
                        this.resultLimit = 6;
                        this.load();
                        this.widthChangeExecced = 3;
                    }
                }
            }
        });
    }

    load = () => {
        if (window.innerWidth > 1380) {
            this.resultLimit = 15;
        } else if (window.innerWidth <= 1380 && window.innerWidth > 1090) {
            this.resultLimit = 12;
        } else if (window.innerWidth <= 1090 && window.innerWidth > 830) {
            this.resultLimit = 9;
        } else if (window.innerWidth <= 830) {
            this.resultLimit = 6;
        }

        // item details page is using this file,
        // reduce results per page
        if (this.props.obj) {
            this.resultLimit = this.resultLimit / 3 * 2;
        }

        ItemService.getItemsByTransaction(
            "-offers",
            this.state.currentPage,
            this.resultLimit
        ).then(response => {
            this.setState({
                totalPages: response.data.totalPages,
                results: response.data.results,
                items: response.data.items
            }, () => this.loadPageButtons());
        }).catch((error) => {
            if (error.response && error.response.status != 500) {
                console.log(error.response.data.message);
            } else {
                console.log(error);
            }
            this.setState({
                notfound: true
            });
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
        // redirect to page 1 if user tries to access page with no items
        if (this.state.totalPages > 0 && page > this.state.totalPages) {
            search_params.set("page", 1);
            return <Redirect to={url.pathname + "?" + search_params.toString()} />
        }
        if (!page || page === "") {
            search_params.set("page", 1);
            const pageURL = url.pathname + "?" + search_params.toString();
            return <Redirect to={pageURL} />
        }
        // ========== end of GET param validation ==========
        return (
            <div className="page-container">
                {(!this.props.obj || this.props.obj == false) && (
                    <Helmet>
                        <title>Popular Offers</title>
                    </Helmet>
                )}
                <div className="title">Popular Offers</div>
                <hr className="section-line" />
                <div className="menu white-container">
                    {this.state.items.length > 0
                        && this.state.items.map((item, index) => (
                            <a href={"/item/" + item._id} className="item-box" key={index}>
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
                        ))}

                    {this.state.notfound && (
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