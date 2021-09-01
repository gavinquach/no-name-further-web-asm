import { React, Component } from 'react';
import { Link } from 'react-router-dom';

import ItemService from "../../services/item.service";
import { CategoryList } from './item-categories.js';

import '../../css/ItemCategories.css';

export default class ItemCategory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            category: "",
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
        const queryParams = new URLSearchParams(window.location.search);

        // no page parameter in URL, redirect to page 1
        if (!this.state.currentPage) {
            // get URL for redirect
            const paths = window.location.href.split("/");
            let url = null;
            paths.map((path, index) => {
                if (path.includes("items")) {
                    url = paths[index];
                }
            });

            let index = -1;
            if (url.indexOf("page") < 0) {
                index = url.length;
            } else {
                index = url.indexOf("page");
            }

            let pageURL = "";
            for (let i = 0; i < index; i++) {
                pageURL += url[i];
            }
            if (pageURL[pageURL.length - 1] !== "&") {
                pageURL += "&";
            }
            pageURL += "page=1";
            return window.location.replace("/" + pageURL);
        }

        let category = queryParams.get('category');
        CategoryList.map(c => {
            if (category == c.url) {
                category = c.title;
                this.setState({ category: c.title });
            }
        });

        ItemService.getItemsByCategory(
            category,
            this.state.currentPage
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

        // get URL for redirect
        const paths = window.location.href.split("/");
        let url = null;
        paths.map((path, index) => {
            if (path.includes("items")) {
                url = paths[index];
            }
        });

        const buttons = [];
        if (this.state.currentPage > 1) {
            const prevPage = this.state.currentPage - 1;
            const pageURL = this.replaceAt(url, url.indexOf("page") + 5, prevPage.toString());
            buttons.push(
                <Link to={pageURL} onClick={() => this.updatePage(prevPage)}>
                    <button>Previous</button>
                </Link>
            );
        }
        for (let i = 1; i <= this.state.totalPages; i++) {
            // replace page number with index number
            const pageURL = this.replaceAt(url, url.indexOf("page") + 5, i.toString());

            if (i === this.state.currentPage) {
                buttons.push(
                    <button disabled>{i}</button>
                )
            } else {
                buttons.push(
                    <Link to={pageURL} onClick={() => this.updatePage(i)}>
                        <p style={{ display: "inline", margin: '0px 8px' }}>{i}</p>
                    </Link>
                )
            }
        }
        if (this.state.currentPage < this.state.totalPages) {
            const nextPage = this.state.currentPage + 1;
            const pageURL = this.replaceAt(url, url.indexOf("page") + 5, nextPage.toString());
            buttons.push(
                <Link to={pageURL} onClick={() => this.updatePage(nextPage)}>
                    <button>Next</button>
                </Link>
            );
        }
        this.setState({ pageButtons: buttons });
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
                <br />
                <br />
                <div className="page-buttons">
                    {this.state.pageButtons}
                </div>
            </div>
        )
    }
}