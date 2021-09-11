import React, { Component } from "react";
import { Helmet } from "react-helmet";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import draftToHtml from 'draftjs-to-html';
import DOMPurify from 'dompurify';

import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";
import ItemService from "../../services/item.service";
import TransactionService from "../../services/transaction.service";
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
            notfound: false,
            item: null,
            images: [],
            successful: false,
            message: ""
        };
    }

    // get user info and assign to input fields
    componentDidMount() {
        ItemService.viewOneItem(this.props.match.params.id)
            .then(response => {
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
        UserService.addItemToCart(
            this.props.match.params.id,
            AuthService.getCurrentUser().id
        ).then(
            response => {
                this.setState({
                    message: response.data.message,
                    successful: true
                });
            },
            error => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();

                this.setState({
                    successful: false,
                    message: resMessage
                });
            }
        );
    }

    makeTransaction = () => {
        TransactionService.createTransactionWithNotification(
            this.state.item,
            AuthService.getCurrentUser().id
        ).then(
            response => {
                if (response.status == 200) {
                    this.setState({
                        message: response.data.message,
                        successful: true
                    });
                } else {
                    this.setState({
                        message: response.data.message,
                        successful: false
                    });
                }
            },
            error => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();

                this.setState({
                    successful: false,
                    message: resMessage
                });
            }
        );
    }

    chatWithUser = () => {
        const data = {
            user: AuthService.getCurrentUser().id,
            receiver: this.state.item.seller._id
        };
        socket.emit("chatWithUserRequest", data);
    }

    render() {
        const item = this.state.item && this.state.item;

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
                        <Helmet>
                            <title>Item details</title>
                        </Helmet>
                        <div className="ItemDetailsContainer">
                            <div className="title">Item Details</div>
                            <hr className="section-line" />
                            <Carousel fade>
                                {item.images.map((image, index) => {
                                    return (
                                        <Carousel.Item key={"carousel-item-" + index}>
                                            <img
                                                className="CarouselImage"
                                                src={process.env.REACT_APP_NODEJS_URL.concat("images/", image.name)}
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
                                    <button className="ChatWithUser" onClick={this.chatWithUser}>Chat with user</button>
                                </Col>
                            </Row>
                            <hr className="divide" />
                            <div className="Flexbox-container">
                                <div style={{ width: '70%' }}>
                                    <h2 className="SectionHeader">Details:</h2>
                                    <div id="details-section">
                                        <div id="date-text-container">
                                            <div>Upload date: {formatDate(item.upload_date)}</div>
                                            <div>Last updated: {formatDate(item.last_update)}</div>
                                        </div>
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
                                                <div>{item.type.name}</div>
                                                <div>{item.quantity}</div>
                                            </div>
                                            <div className="SeparateLine" />
                                            <div className="Column">
                                                Item I want:
                                                <div>{item.forItemType.name}</div>
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
                                                    <div>This user doesn't provide any description.</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="DetailsRightColumn">
                                    <div className="ItemStats">
                                        <p>Views: . Offers: {item.offers}</p>
                                    </div>
                                    <div className="ActionButtons">
                                        <button className="add-to-cart" onClick={this.addToCart}>Add To Cart</button>
                                        <br />
                                        <br />
                                        <button className="request-trade" onClick={this.makeTransaction}>Request trade</button>
                                        {this.state.message && (
                                            <div className="statusMsg">
                                                <div className={this.state.successful ? "alert alert-success" : "alert alert-danger"} role="alert">
                                                    {this.state.message}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <hr className="divide" />
                            <Row>
                                <PopularOffers obj={true} />
                            </Row>
                        </div>
                    </span>
                )}
            </div>
        );
    }
}