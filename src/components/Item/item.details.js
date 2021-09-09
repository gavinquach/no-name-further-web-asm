import React, { Component } from "react";
import { Helmet } from "react-helmet";
import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";
import ItemService from "../../services/item.service";
import TransactionService from "../../services/transaction.service";
import socket from '../../services/socket';

import "../../css/ItemDetails.css"

// const updateQty = (id) => {
//     let qtyValue = document.getElementById("qty-value").value;
//     if (!isNaN(qtyValue)) {
//         Math.round(qtyValue);
//         if (id === "decrease-qty") {
//             if (qtyValue > 1) {
//                 qtyValue--;
//                 document.getElementById("qty-value").value = qtyValue;
//             }
//         } else {
//             qtyValue++;
//             document.getElementById("qty-value").value = qtyValue;
//         }
//     }
// }

const changeImage = (e) => {
    let item;
    let img;
    if (e.target.tagName == "LI") {
        item = e.target;
        img = e.target.firstChild.src;
    }
    else if (e.target.tagName == "IMG") {
        item = e.target.parentElement;
        img = e.target.src;
    }

    document.getElementById("main-image").src = img;

    // get elements from class to remove border from
    let elements = document.getElementsByClassName("image-item");

    // remove border from all images
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove("image-list-img-border");
    }
    // add border to selected preview image
    item.classList.add("image-list-img-border");
}

export default class ItemDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            notfound: false,
            item: {
                _id: "",
                name: "",
                quantity: 0,
                type: "",
                forItemName: "",
                forItemQty: 0,
                forItemType: "",
                images: [],
                seller: "",
                offers: 0
            },
            images: [],
            successful: false,
            message: ""
        };
    }

    // get user info and assign to input fields
    componentDidMount() {
        ItemService.viewOneItem(this.props.match.params.id)
            .then(response => {
                if (response.status != 200) {
                    this.setState({
                        notfound: true
                    });
                }
                this.setState({
                    item: {
                        _id: response.data._id,
                        name: response.data.name,
                        quantity: response.data.quantity,
                        type: response.data.type.name,
                        forItemName: response.data.forItemName,
                        forItemQty: response.data.forItemQty,
                        forItemType: response.data.forItemType.name,
                        images: response.data.images,
                        seller: response.data.seller._id,
                        offers: response.data.offers
                    },
                    seller: response.data.seller,
                }, () => this.addImages());
            })
            .catch((error) => {
                this.setState({
                    notfound: true
                });
                if (error.response.status != 500) {
                    console.log(error.response.data.message);
                } else {
                    console.log(error);
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

    render() {
        return (
            <div>
                {this.state.notfound ? (
                    <div className="container" style={{ width: '60em', height: '40em' }}>
                        <h1 style={{ textAlign: 'center', marginTop: '50%' }}>
                            Something went wrong, we can't find the item :(
                        </h1>
                    </div>
                ) : (
                    <div className="page-container">
                        <Helmet>
                            <title>{this.state.item.name} | Details</title>
                        </Helmet>
                        <div className="title">Item Details</div>
                        <hr className="section-line" />
                        <div className="item white-container">
                            <div className="item-image-box">
                                <div className="item-image">
                                    {this.state.item.images.map((image, index) =>
                                        image.cover && (
                                            <img id="main-image" src={process.env.REACT_APP_NODEJS_URL.concat("images/", image.name)} />
                                        )
                                    )}
                                </div>

                                <ul className="image-list">
                                    {/* show cover first */}
                                    {this.state.item.images.map((image, index) =>
                                        image.cover && (
                                            <li key={index} className="image-item" onClick={changeImage}><img src={process.env.REACT_APP_NODEJS_URL.concat("images/", image.name)} /></li>
                                        )
                                    )}
                                    {/* then show other images */}
                                    {this.state.item.images.map((image, index) =>
                                        !image.cover && (
                                            <li key={index} className="image-item" onClick={changeImage}><img src={process.env.REACT_APP_NODEJS_URL.concat("images/", image.name)} /></li>
                                        )
                                    )}
                                </ul>
                            </div>

                            <div>
                                <h2>{this.state.item.name}</h2>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>Type:</td>
                                            <td>{this.state.item.type}</td>
                                        </tr>
                                        <tr>
                                            <td>Quantity:</td>
                                            <td>{this.state.item.quantity}</td>
                                        </tr>
                                        <tr>
                                            <td>For item:</td>
                                            <td>{this.state.item.forItemName}</td>
                                        </tr>
                                        <tr>
                                            <td>For item type:</td>
                                            <td>{this.state.item.forItemType}</td>
                                        </tr>
                                        <tr>
                                            <td>For item quantity:</td>
                                            <td>{this.state.item.forItemQty}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* <div className="qtySelector text-center">
                                <i className="qtyBtn minus decreaseQty" id="decrease-qty" onClick={() => updateQty(this.id)}></i>
                                <input type="text" className="qtyValue" id="qty-value" value="1" />
                                <i className="qtyBtn plus increaseQty" id="increase-qty" onClick={() => updateQty(this.id)}></i>
                            </div> */}

                                <br />
                                <br />

                                <button id="addToCart" className="add-to-cart" onClick={this.addToCart}>Add To Cart</button>
                                <br />
                                <br />
                                <button id="makeTransaction" className="make-transaction" onClick={this.makeTransaction}>Request trade</button>
                                <br />
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
                )}
            </div>
        );
    }
}