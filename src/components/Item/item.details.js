import React, { Component } from "react";
import { Helmet } from "react-helmet";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import draftToHtml from 'draftjs-to-html';
import DOMPurify from 'dompurify';

import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";
import ItemService from "../../services/item.service";
import TradeService from "../../services/trade.service";
import socket from '../../services/socket';

import { Row, Carousel, Col } from "react-bootstrap";

import PopularOffers from "../popularoffers";

import "../../css/ItemDetails.css"

// format the date to be readable from Date object
const formatDate = (d) => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const dateObj = new Date(d);
    const date = dateObj.getDate();
    const month = monthNames[dateObj.getMonth()];   // add leading 0 to month
    const year = dateObj.getFullYear();
    const hour = ("0" + dateObj.getHours()).slice(-2);   // add leading 0 to hour
    const minute = ("0" + (dateObj.getMinutes())).slice(-2);   // add leading 0 to minute
    const second = ("0" + (dateObj.getSeconds())).slice(-2);

    return `${month} ${date}, ${year} at ${hour}:${minute}:${second}`;
}

export default class ItemDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selfItem: false,
            notfound: false,
            item: null,
            images: [],
            successful: false,
            message: ""
        };
    }

    // get user info and assign to input fields
    componentDidMount() {
        if (!this.props.obj) {
            ItemService.viewOneItem(this.props.match.params.id)
                .then(response => {
                    if (response.data.seller._id == AuthService.getCurrentUser().id) {
                        this.setState({
                            selfItem: true
                        })
                    }
                    this.setState({
                        item: response.data
                    }, () => this.addImages());
                })
                .catch((error) => {
                    this.setState({
                        notfound: true
                    });
                    if (error.response && error.response.status != 500) {
                        console.log(error.response.data.message);
                    } else {
                        console.log(error.response);
                    }
                })
        }
    }

    addImages = () => {
        const imgList = [];
        this.state.item.images.map(image => {
            imgList.push({
                // format image data to 
                data_url: process.env.REACT_APP_NODEJS_URL.concat("images/", image.name),
                file: {
                    name: image.name,
                    size: image.size,
                    type: image.type
                },
                cover: image.cover
            });

            this.setState({ images: imgList });
        })
    }

    addToCart = () => {
        if (!this.state.selfItem) {
            UserService.addItemToCart(
                this.props.match.params.id,
                AuthService.getCurrentUser().id
            ).then((response) => {
                this.setState({
                    message: response.data.message,
                    successful: true
                });
            }).catch((error) => {
                if (error.response && error.response.status != 500) {
                    this.setState({
                        message: error.response.data.message,
                        successful: false
                    });
                } else {
                    this.setState({
                        message: error,
                        successful: false
                    });
                }
            });
        }
    }

    requestTrade = () => {
        if (!this.state.selfItem) {
            TradeService.createTradeWithNotification(
                this.state.item,
                AuthService.getCurrentUser().id
            ).then((response) => {
                this.setState({
                    message: response.data.message,
                    successful: true
                });
            }).catch((error) => {
                if (error.response && error.response.status != 500) {
                    this.setState({
                        message: error.response.data.message,
                        successful: false
                    });
                } else {
                    this.setState({
                        message: error,
                        successful: false
                    });
                }
            });
        }
    }

    chatWithUser = () => {
        if (!this.state.selfItem) {
            const data = {
                user: AuthService.getCurrentUser().id,
                receiver: this.state.item.seller._id
            };
            socket.emit("chatWithUserRequest", data);
        }
    }

    render() {
        let item = null;
        if (this.props.obj) {
            item = this.props.obj;
        } else {
            item = this.state.item && this.state.item;
        }

        // parse description to be able to display in HTML
        let description = null;
        if (item && item.description) {
            description = draftToHtml(
                JSON.parse(item.description)
            );
        }
        return (
            <div>
                {this.state.notfound && (
                    <span style={{ textAlign: 'center' }}>
                        <Helmet>
                            <title>404 Item not found</title>
                        </Helmet>
                        <h1>
                            <FontAwesomeIcon id="fa-icon-frown" icon={faFrown} />
                        </h1>
                        <h1 id="four-o-four">404</h1>
                        <h1>Item not found</h1>
                    </span>
                )}
                {item && (
                    <span>
                        {!this.props.obj && (
                            <Helmet>
                                <title>Item details</title>
                            </Helmet>
                        )}
                        <div className={!this.props.obj && "ItemDetailsContainer"}>
                            {!this.props.obj && (
                                <span>
                                    <div className="title">Item Details</div>
                                    <hr className="section-line" />
                                </span>
                            )}
                            {this.state.selfItem && (
                                <h3>(You are viewing your own item)</h3>
                            )}
                            <Carousel fade>
                                {item.images && item.images.map((image, index) => {
                                    return (
                                        <Carousel.Item key={"carousel-item-" + index}>
                                            <img
                                                className="CarouselImage"
                                                src={!this.props.obj
                                                    ? process.env.REACT_APP_NODEJS_URL.concat("images/", image.name)
                                                    : image.data_url}
                                                alt={"Slide" + index}
                                            />
                                        </Carousel.Item>
                                    )
                                })}
                            </Carousel>
                            <Row>
                                <Col className="UserDetails">
                                    {/* <img className="avatar-image" src="" alt="User avatar" /> */}
                                    <FontAwesomeIcon icon={faUserCircle} id="avatar" />

                                    <div className="NameLocation">
                                        <h2>{item.seller.username}</h2>
                                        <h4><b>City:</b> {item.seller.location[0].replace("Thành phố ", "").replace("Tỉnh ", "")}</h4>
                                        <h4><b>District:</b> {item.seller.location[1].replace("Huyện ", "").replace("Quận ", "")}</h4>
                                    </div>
                                    {(!this.state.selfItem) && (
                                        <button className="ChatWithUser" onClick={!this.props.obj && this.chatWithUser}>Chat with user</button>
                                    )}
                                </Col>
                            </Row>
                            <hr className="divide" />
                            <div className="Flexbox-container">
                                <div style={{ width: '70%' }}>
                                    <h2 className="SectionHeader">Details:</h2>
                                    <div id="details-section">
                                        {!this.props.obj ? (
                                            <div id="date-text-container">
                                                <div>Upload date: {formatDate(item.upload_date)}</div>
                                                <div>Last updated: {formatDate(item.last_update)}</div>
                                            </div>
                                        ) : (
                                            <div id="date-text-container">
                                                <div>Upload date: {formatDate(new Date())}</div>
                                                <div>Last updated: {formatDate(new Date())}</div>
                                            </div>
                                        )}
                                        <div id="want-to-trade-text">
                                            I want to trade <b>{item.name}</b> with <b>{item.forItemName}</b>
                                        </div>

                                        <br />

                                        <div className="TypeQuantityContainer">
                                            <div style={{ marginRight: '30px' }}>
                                                <br />
                                                <div><b>Category:</b></div>
                                                <div><b>Quantity:</b></div>
                                            </div>
                                            <div className="Column">
                                                My item:
                                                <div>
                                                    {!this.props.obj
                                                        ? item.type.name
                                                        : item.type
                                                    }
                                                </div>
                                                <div>{item.quantity}</div>
                                            </div>
                                            <div className="SeparateLine" />
                                            <div className="Column">
                                                Item I want:
                                                <div>
                                                    {!this.props.obj
                                                        ? item.forItemType.name
                                                        : item.forItemType
                                                    }
                                                </div>
                                                <div>{item.forItemQty}</div>
                                            </div>
                                        </div>
                                        <br />
                                        <hr />
                                        <div>
                                            <h2 className="SectionHeader">Description:</h2>
                                            <div className="Description">
                                                {description ? (
                                                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) }} />
                                                ) : (
                                                    <div>This user did not provide any description.</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="DetailsRightColumn">
                                    <div className="ItemStats">
                                        {!this.props.obj ? (
                                            <p>Views: . Offers: {item.offers}</p>
                                        ) : (
                                            <p>Views: 99999. Offers: 777</p>
                                        )}
                                    </div>
                                    {(!this.state.selfItem) && (
                                        <div className="ActionButtons">
                                            <button className="add-to-cart" onClick={!this.props.obj && this.addToCart}>Add To Cart</button>
                                            <br />
                                            <br />
                                            <button className="request-trade" onClick={!this.props.obj && this.requestTrade}>Request trade</button>
                                            {this.state.message && (
                                                <div className="statusMsg">
                                                    <div className={this.state.successful ? "alert alert-success" : "alert alert-danger"} role="alert">
                                                        {this.state.message}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <br /><br /><br />
                            <hr className="divide" />
                            {!this.props.obj && (
                                <PopularOffers obj={true} />
                            )}
                        </div>
                    </span>
                )}
            </div>
        );
    }
}