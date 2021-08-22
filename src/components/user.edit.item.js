import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import ImageUploading from "react-images-uploading";    // npm install --save react-images-uploading

import NavigationBar from "../NavigationBar"
import AuthService from "../services/auth.service";

import '../css/UserPages.css'

const required = value => {
    if (!value) {
        return (
            <div className="alert alert-danger" role="alert">
                This field is required!
            </div>
        );
    }
};

const vquantity = value => {
    if (value < 1 || value > 999) {
        return (
            <div className="alert alert-danger" role="alert">
                Invalid quantity
            </div>
        );
    }
};

export default class UserEditItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            acceptImageType: ['jpg', 'jpeg', 'png', 'bmp'],
            maxNumber: 4,
            maxFileSize: 5000000,
            resolutionType: "less",
            maxWidth: 1920,
            maxHeight: 1920,
            name: "",
            quantity: 0,
            type: "",
            oldImgList: [],
            images: [],
            forItemName: "",
            forItemQty: 0,
            forItemType: "",
            hasCoverImg: false,
            successful: false,
            message: "",
        };
    }

    // get user info and assign to input fields
    componentDidMount() {
        AuthService.viewOneItem(this.props.match.params.id)
            .then(response => {
                this.setState({
                    name: response.data.name,
                    quantity: response.data.quantity,
                    type: response.data.type,
                    forItemName: response.data.forItemName,
                    forItemQty: response.data.forItemQty,
                    forItemType: response.data.forItemType,
                    oldImgList: response.data.images
                }, () => this.addImages());
            }, error => {
                this.props.history.push("/user/items");
            })
            .catch(function (error) {
                console.log(error);
            })

    }

    addImages = () => {
        const imgList = [];
        this.state.oldImgList.map(image => {
            imgList.push({
                // format image data to 
                data_url: Buffer.from(image.data_url).toString('utf8'),
                file: {
                    name: image.name,
                    size: image.size,
                    type: image.type
                },
                cover: image.cover
            });
            if (image.cover) this.setState({ hasCoverImg: true, maxNumber: 5 });

            this.setState({
                images: imgList
            });
        });
    }

    delete = () => {
        if (window.confirm("Are you sure you want to delete this listing?")) {
            AuthService.deleteItem(this.props.match.params.id)
                .then(
                    response => {
                        this.setState({
                            message: response.data.message,
                            successful: true
                        });

                        // redirect to view item page after delete
                        this.props.history.push('/user/items');
                    }, error => {
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
    }

    removeCoverImg = () => {
        this.setState({
            hasCoverImg: false,
            maxNumber: 4
        });
    }

    onChangeName = (e) => {
        this.setState({
            name: e.target.value
        });
    }

    onChangeQty = (e) => {
        this.setState({
            quantity: e.target.value
        });
    }

    onChangeType = (e) => {
        this.setState({
            type: e.target.value
        });
    }

    onChangeForItemName = (e) => {
        this.setState({
            forItemName: e.target.value
        });
    }

    onChangeForItemQty = (e) => {
        this.setState({
            forItemQty: e.target.value
        });
    }

    onChangeForItemType = (e) => {
        this.setState({
            forItemType: e.target.value
        });
    }

    onChangeUploadImage = (imageList) => {
        const imgList = [];

        imageList.map(image => {
            imgList.push({
                data_url: image.data_url,
                file: {
                    name: image.file.name,
                    size: image.file.size,
                    type: image.file.type
                },
                cover: (typeof image.cover === "undefined" || !image.cover) ? false : true
            })
        });

        this.setState({ images: imgList });
    };

    onChangeUploadCoverImage = (imageList, index) => {
        if (imageList.length > 1) {
            if (index) {
                imageList.map((image, i) => {
                    if (image.cover) {
                        imageList.splice(i, 1);
                    }
                });

                if (index == imageList.length) {
                    imageList[index - 1].cover = true;
                } else {
                    imageList[index].cover = true;
                }
            }

            const imgList = [];
            imageList.map(image => {
                imgList.push({
                    data_url: image.data_url,
                    file: {
                        name: image.file.name,
                        size: image.file.size,
                        type: image.file.type
                    },
                    cover: image.cover ? true : false
                })
            });

            this.setState({
                hasCoverImg: true,
                maxNumber: 5,
                images: imgList
            });
        } else {
            const imgList = this.state.images;
            imgList.map((image, index) => {
                if (image.cover) imgList.splice(index, 1);
            });
            imageList.map(image => {
                imgList.push({
                    data_url: image.data_url,
                    file: {
                        name: image.file.name,
                        size: image.file.size,
                        type: image.file.type
                    },
                    cover: true
                })
            });

            this.setState({
                hasCoverImg: true,
                images: imgList,
                maxNumber: 5,
                images: imgList
            });
        }
    };

    handleRegister = (e) => {
        e.preventDefault();

        this.form.validateAll();

        if (this.state.images.length == 0) {
            this.setState({
                successful: false,
                message: "Please upload at least 1 image."
            });
            return;
        }

        if (this.state.images.length > this.state.maxNumber) {
            this.setState({
                successful: false,
                message: "Exceeded maximum amount of images allowed (1 cover and 4 other images)!"
            });
            return;
        }

        if (!this.state.hasCoverImg) {
            this.setState({
                successful: false,
                message: "Cover image required."
            });
            return;
        }

        if (this.checkBtn.context._errors.length === 0) {
            // need to upload item then images can be uploaded with this item id
            const item = {
                name: this.state.name,
                quantity: this.state.quantity,
                type: this.state.type,
                forItemName: this.state.forItemName,
                forItemQty: this.state.forItemQty,
                forItemType: this.state.forItemType,
            };

            const newImgList = [];
            this.state.images.map(image => {
                newImgList.push({
                    data_url: image.data_url,
                    name: image.file.name,
                    size: image.file.size,
                    type: image.file.type,
                    cover: image.cover
                })
            });

            AuthService.editItem(
                this.props.match.params.id,
                item,
                this.state.oldImgList,
                newImgList
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
    }

    render() {
        return (
            <div>
                <NavigationBar />
                <div className="container" style={{ width: "60em" }}>
                    <Form onSubmit={this.handleRegister} ref={c => { this.form = c; }}>
                        <h1 className="Big-text">Edit item</h1>
                        <br />

                        <h2>Your item:</h2>
                        <Input
                            id="name"
                            name="name"
                            className="Input"
                            type="text"
                            placeholder="Item name"
                            value={this.state.name}
                            onChange={this.onChangeName}
                            validations={[required]}
                        />
                        <div className="Flex-row">
                            <div className="Flex-row-item">
                                <Input
                                    id="type"
                                    name="type"
                                    className="Input Item-type-input"
                                    type="text"
                                    placeholder="Item type"
                                    value={this.state.type}
                                    onChange={this.onChangeType}
                                    validations={[required]}
                                    style={{ display: "table-cell" }}
                                />
                            </div>
                            <div className="Flex-row-item">
                                <Input
                                    id="quantity"
                                    name="quantity"
                                    className="Input Item-qty-input"
                                    type="number" min="0" max="999"
                                    placeholder="Item quantity"
                                    value={this.state.quantity}
                                    onChange={this.onChangeQty}
                                    validations={[required, vquantity]}
                                />
                            </div>
                        </div>

                        <br />
                        <hr />

                        <h2>Item you need:</h2>

                        <Input
                            id="for-item-name"
                            name="for-item-name"
                            className="Input Same-row"
                            type="text"
                            placeholder="Item name"
                            value={this.state.forItemName}
                            onChange={this.onChangeForItemName}
                            validations={[required]}
                        >
                        </Input>
                        <div className="Flex-row">
                            <div className="Flex-row-item">
                                <Input
                                    id="for-item-type"
                                    name="for-item-type"
                                    className="Input Item-type-input Same-row"
                                    type="text"
                                    placeholder="Item type"
                                    value={this.state.forItemType}
                                    onChange={this.onChangeForItemType}
                                    validations={[required]}
                                />
                            </div>
                            <div className="Flex-row-item">
                                <Input
                                    id="for-item-quantity"
                                    name="for-item-quantity"
                                    className="Input Item-qty-input Same-row"
                                    type="number" min="0" max="999"
                                    placeholder="Item quantity"
                                    value={this.state.forItemQty}
                                    onChange={this.onChangeForItemQty}
                                    validations={[required, vquantity]}
                                />
                            </div>
                        </div>

                        <br />
                        <hr />

                        <h2>Your item images:</h2>
                        <div>
                            Requirements:
                            <li>File size does not exceed {this.state.maxFileSize / 1000000}MB.</li>
                            <li>File resolution does not exceed {this.state.maxWidth}px * {this.state.maxHeight}px.</li>
                            <li>1 cover page and 4 item images.</li>
                        </div>

                        <br />
                        <ImageUploading
                            value={this.state.images}
                            maxFileSize={this.state.maxFileSize}
                            onChange={this.onChangeUploadCoverImage}
                            resolutionType={this.state.resolutionType}
                            resolutionWidth={this.state.maxWidth}
                            resolutionHeight={this.state.maxHeight}
                            acceptType={this.state.acceptImageType}
                            dataURLKey="data_url"
                        >
                            {({
                                onImageUpload,
                                onImageUpdate,
                                onImageRemove,
                                isDragging,
                                dragProps,
                                errors
                            }) => (
                                <div className="upload__image-wrapper">
                                    <h3>Cover image</h3>
                                    {errors && (
                                        <div>
                                            {errors.maxNumber && <span>Exceeded maximum upload amount (1)!</span>}
                                            {errors.acceptType && <span>The selected file type is not allow!</span>}
                                            {errors.maxFileSize && <span>Selected file size exceed {this.state.maxFileSize / 1000000}MB!</span>}
                                            {errors.resolution && <span>Selected file exceeded allowed resolution ({this.state.maxWidth}px * {this.state.maxHeight}px)</span>}
                                            <br />
                                        </div>)}

                                    {!this.state.hasCoverImg ?
                                        <button
                                            className="ImageUploadBox"
                                            type="button"
                                            style={isDragging ? { fontWeight: 'bold', color: "red" } : null}
                                            onClick={onImageUpload}
                                            {...dragProps}
                                        >
                                            {isDragging ? "Drop to upload" : (<div>Click or drop here to upload image</div>)}
                                        </button>
                                        : this.state.images.map((image, index) =>
                                            image.cover &&
                                            (
                                                <div key={index} className="container ImagePanels">
                                                    <img src={image.data_url} alt={image.file.name} />
                                                    <button type="button" onClick={() => onImageUpdate(index)}>Update</button>
                                                    <button type="button" onClick={() => { onImageRemove(index), this.removeCoverImg() }} className="Remove-btn">Remove</button>
                                                    <p>{image.file.name}</p>
                                                </div>
                                            ))
                                    }
                                </div>
                            )}
                        </ImageUploading>

                        <hr />

                        <ImageUploading
                            multiple
                            value={this.state.images}
                            onChange={this.onChangeUploadImage}
                            maxNumber={this.state.maxNumber}
                            maxFileSize={this.state.maxFileSize}
                            resolutionType={this.state.resolutionType}
                            resolutionWidth={this.state.maxWidth}
                            resolutionHeight={this.state.maxHeight}
                            acceptType={this.state.acceptImageType}
                            dataURLKey="data_url"
                        >
                            {({
                                imageList,
                                onImageUpload,
                                onImageRemoveAll,
                                onImageUpdate,
                                onImageRemove,
                                isDragging,
                                dragProps,
                                errors
                            }) => (
                                <div className="upload__image-wrapper">
                                    <h3>Other images</h3>
                                    {errors && (
                                        <div>
                                            {errors.maxNumber && <span>Exceeded maximum upload amount ({this.state.maxNumber})!</span>}
                                            {errors.acceptType && <span>The selected file type is not allow!</span>}
                                            {errors.maxFileSize && <span>Selected file size exceed {this.state.maxFileSize / 1000000}MB!</span>}
                                            {errors.resolution && <span>Selected file exceeded allowed resolution ({this.state.maxWidth}px * {this.state.maxHeight}px)</span>}
                                            <br />
                                        </div>)}

                                    {(this.state.images.length < this.state.maxNumber) && (
                                        <span>
                                            <button
                                                className="ImageUploadBox"
                                                type="button"
                                                style={isDragging ? { fontWeight: 'bold', color: "red" } : null}
                                                onClick={onImageUpload}
                                                {...dragProps}
                                            >
                                                {isDragging ? "Drop to upload" : (<div>Click or drop here to upload image</div>)}
                                            </button>
                                            <br />
                                        </span>)
                                        // : (
                                        //     <button type="button" onClick={onImageRemoveAll} className="Remove-all-btn">
                                        //         Remove all images
                                        //     </button>
                                        // )
                                    }
                                    {this.state.images.map((image, index) =>
                                        !image.cover &&
                                        (
                                            <div key={index} className="container ImagePanels">
                                                <img src={image.data_url} alt={image.file.name} />
                                                <button type="button" onClick={() => onImageUpdate(index)}>Update</button>
                                                <button type="button" onClick={() => onImageRemove(index)} className="Remove-btn">Remove</button>
                                                <p>{image.file.name}</p>
                                            </div>
                                        ))
                                    }
                                    <hr />
                                </div>
                            )}
                        </ImageUploading>

                        <br />
                        <button type="submit" className="Create-btn">Submit</button>
                        {this.state.message && (
                            <div className="form-group">
                                <div className={this.state.successful ? "alert alert-success" : "alert alert-danger"} role="alert">
                                    {this.state.message}
                                </div>
                            </div>
                        )}
                        <CheckButton style={{ display: "none" }} ref={c => { this.checkBtn = c; }} />
                    </Form>

                    <hr />
                    <br />

                    <div>
                        <h1 className="Big-text">Preview of listing</h1>
                        <h3>Show preview down here, preview will look like what it will look like on the actual listing page.</h3>
                    </div>

                    <br />
                    <hr />
                    <br /><br /><br />

                    <h1 className="Big-text">Delete listing</h1>
                    <button type="button" onClick={() => this.delete()} className="delete-item-button-single">
                        Delete item
                    </button>

                    <br /><br /><br />
                </div>
            </div>
        );
    }
}
