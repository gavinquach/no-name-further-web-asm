import React, { Component } from "react";

import AuthService from "../services/auth.service";
import NavigationBar from "../NavigationBar";

import '../css/ItemDetails.css'

const changeImage = (e) => {
    console.log(e.target);
    document.getElementById("main-image").src = e.target.src;
    // get elements from class to remove border from
    let elements = document.getElementsByClassName("image-item");

    // remove border from all images
    for (let i = 0; i < elements.length; i++) {
        let child = elements[i].children[0];
        child.classList.remove("image-list-img-border");
    }
    // add border to selected preview image
    e.target.classList.add("image-list-img-border");
}

const updateQty = (id) => {
    let qtyValue = document.getElementById("qty-value").value;
    if (!isNaN(qtyValue)) {
        Math.round(qtyValue);
        if (id === "decrease-qty") {
            if (qtyValue > 1) {
                qtyValue--;
                document.getElementById("qty-value").value = qtyValue;
            }
        } else {
            qtyValue++;
            document.getElementById("qty-value").value = qtyValue;
        }
    }
}

export default class ItemDetails extends Component {
    constructor(props) {
        super(props);
        this.imageIds = [];

        this.state = {
            name: "",
            quantity: 0,
            type: "",
            forItemName: "",
            forItemQty: 0,
            forItemType: "",
            images: [],
            successful: false,
            message: ""
        };
    }

    // get user info and assign to input fields
    componentDidMount() {
        AuthService.viewOneItem(this.props.match.params.id)
            .then(response => {
                this.imageIds = response.data.images;
                this.setState({
                    name: response.data.name,
                    quantity: response.data.quantity,
                    type: response.data.type,
                    forItemName: response.data.forItemName,
                    forItemQty: response.data.forItemQty,
                    forItemType: response.data.forItemType
                }, () => this.addImages());
            })
            .catch(function (error) {
                console.log(error);
            })

    }

    // add images from list of image ids when getting item
    // and also store into old image list to remove the old
    // images in the database when we update
    addImages = () => {
        const imgList = [];
        this.imageIds.map(id => {
            AuthService.getImage(id)
                .then(response => {
                    imgList.push({
                        // format image data to 
                        data_url: Buffer.from(response.data.data_url).toString('utf8'),
                        file: {
                            name: response.data.name,
                            size: response.data.size,
                            type: response.data.type
                        },
                        cover: response.data.cover
                    });

                    this.setState({ images: imgList });
                })
                .catch(function (error) {
                    console.log(error);
                })
        });
    }

    addToCart = () => {
        AuthService.addItemToCart(
            this.props.match.params.id, AuthService.getCurrentUser().id
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

    render() {
        return (
            <div>
                <NavigationBar />
                <div className="container">
                    <h1>Item details</h1>
                    <div className="row">
                        <div className="col-sm-6">
                            <div>
                                <div className="item-image">
                                    {this.state.images.map((image, index) =>
                                        image.cover && (
                                            <div key={index} className="item-image">
                                                <img id="main-image" className="active" src={image.data_url} alt={image.file.name} />
                                            </div>
                                        )
                                    )}
                                </div>
                                <ul className="image-list">
                                    {this.state.images.map((image, index) =>
                                        image.cover && (
                                            <li key={index} className="image-item" onClick={changeImage}><img src={image.data_url} /></li>
                                        )
                                    )}
                                    {this.state.images.map((image, index) =>
                                        !image.cover && (
                                            <li key={index} className="image-item" onClick={changeImage}><img src={image.data_url} /></li>
                                        )
                                    )}
                                </ul>
                            </div>
                        </div>

                        <div className="col-sm-6">
                            <h2>{this.state.name}</h2>
                            <br />
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <td>Type:</td>
                                        <td>{this.state.type}</td>
                                    </tr>
                                    <tr>
                                        <td>Quantity:</td>
                                        <td>{this.state.quantity}</td>
                                    </tr>
                                    <tr>
                                        <td>For item:</td>
                                        <td>{this.state.forItemName}</td>
                                    </tr>
                                    <tr>
                                        <td>For item type:</td>
                                        <td>{this.state.forItemType}</td>
                                    </tr>
                                    <tr>
                                        <td>For item quantity:</td>
                                        <td>{this.state.forItemQty}</td>
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

                            <button id="addToCart" className="add-to-cart" name="item" onClick={this.addToCart}>Add To Cart</button>
                            <br />
                            {this.state.message && (
                                <div>
                                    <div className={this.state.successful ? "alert alert-success" : "alert alert-danger"} role="alert">
                                        {this.state.message}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}