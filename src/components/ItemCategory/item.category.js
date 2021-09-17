import { React, Component } from 'react';
import { Link, Redirect } from 'react-router-dom';

import ItemService from "../../services/item.service";
import { CategoryList } from './item-categories.js';
import { Helmet } from "react-helmet";
import '../../css/ItemCategories.css';
import '../../css/ItemMenu.css'

export default class ItemCategory extends Component {
    constructor(props) {
        super(props);
        this.widthChangeExecced = -1;
        this.resultLimit = 10;

        this.state = {
            category: "",
            currentPage: parseInt(new URLSearchParams(window.location.search).get('page')),
            totalPages: 0,
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

        const queryParams = new URLSearchParams(window.location.search);
        let category = queryParams.get('category');
        window.addEventListener('resize', () => {
            if (category) {
                if (this.state.items.length > 0) {
                    if (window.innerWidth > 1380) {
                        if (this.widthChangeExecced != 0) {
                            this.resultLimit = 10;
                            this.load();
                            this.widthChangeExecced = 0;
                        }
                    } else if (window.innerWidth <= 1380 && window.innerWidth > 1090) {
                        if (this.widthChangeExecced != 1) {
                            this.resultLimit = 8;
                            this.load();
                            this.widthChangeExecced = 1;
                        }
                    } else if (window.innerWidth <= 1090 && window.innerWidth > 830) {
                        if (this.widthChangeExecced != 2) {
                            this.resultLimit = 6;
                            this.load();
                            this.widthChangeExecced = 2;
                        }
                    } else if (window.innerWidth <= 830) {
                        if (this.widthChangeExecced != 3) {
                            this.resultLimit = 4;
                            this.load();
                            this.widthChangeExecced = 3;
                        }
                    }
                }
            }
        });
    }

    load = () => {
        if (window.innerWidth > 1380) {
            this.resultLimit = 10;
        } else if (window.innerWidth <= 1380 && window.innerWidth > 1090) {
            this.resultLimit = 8;
        } else if (window.innerWidth <= 1090 && window.innerWidth > 830) {
            this.resultLimit = 6;
        } else if (window.innerWidth <= 830) {
            this.resultLimit = 4;
        }

        const queryParams = new URLSearchParams(window.location.search);
        let category = queryParams.get('category');
        if (!category) return;

        CategoryList.map(c => {
            if (category == c.url) {
                category = c.title;
                this.setState({ category: c.title });
            }
        });

        ItemService.getItemsByCategory(
            category,
            this.state.currentPage,
            this.resultLimit
        ).then(response => {
            this.setState({
                totalPages: response.data.totalPages,
                items: response.data.items
            }, () => this.loadPageButtons());
        }).catch((error) => {
            if (error.response && error.response.status != 500) {
                console.log(error.response.data.message);
            } else {
                console.log(error);
            }
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

        // get URL for redirect
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
                    <Link to={pageURL} onClick={() => this.updatePage(i)}>
                        <p className="page-button" style={{ display: "inline", margin: '0px 8px' }}>{i}</p>
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
            return <Redirect to={pageURL} />
        }
        // ========== end of GET param validation ==========
        return (
            <div>
                <Helmet>
                    <title>{this.state.category}</title>
                </Helmet>
                <div className="title">{this.state.category}</div>
                <hr className="section-line" />
                <div className="menu">
                    {this.state.items.length > 0
                        ? this.state.items.map((item, index) => (
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
                                    <div style={{ textAlign: 'right', fontSize: '15px' }}>Location: {item.seller.location[0]}</div>
                                </div>
                            </Link >
                        )) : (
                            <div>
                                <h2 style={{ textAlign: "center" }}>No items found.</h2>
                            </div>
                        )
                    }
                </div >
                <div className="page-buttons">
                    {this.state.pageButtons}
                </div>

            </div >
        )
    }
}