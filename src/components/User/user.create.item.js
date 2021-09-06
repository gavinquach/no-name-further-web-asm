import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import Select from "react-validation/build/select";
import CheckButton from "react-validation/build/button";
import ImageUploading from "react-images-uploading";    // npm install --save react-images-uploading

import AuthService from "../../services/auth.service";
import ItemService from "../../services/item.service";



import '../../css/UserPages.css'

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

export default class UserCreateItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            acceptImageType: ['jpg', 'jpeg', 'png'],
            maxNumber: 4,
            maxFileSize: 5000000,
            resolutionType: "less",
            maxWidth: 5000,
            maxHeight: 5000,
            name: "",
            quantity: 0,
            type: "",
            coverImage: null,
            otherImages: [],
            forItemName: "",
            forItemQty: 0,
            forItemType: "",
            successful: false,
            message: "",
        };
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
        const list = [];
        imageList.map(image => {
            if (!image.file.cover) {
                image.file.cover = false;
                list.push({
                    data_url: image.data_url,
                    file: image.file
                })
            }
        });

        this.setState({ otherImages: list });
    };

    onCoverImageRemove = () => {
        this.setState({ coverImage: null });
    }

    onChangeUploadCoverImage = (imageList, index) => {
        // add/update
        if (index) {
            imageList.map(image => {
                image.file.cover = true;
                this.setState({
                    coverImage: {
                        data_url: image.data_url,
                        file: image.file
                    }
                });
            });
        }
        // remove
        if (!index) {
            this.setState({ coverImage: null });
        }
    }

    handleRegister = (e) => {
        e.preventDefault();

        this.form.validateAll();

        if (!this.state.coverImage) {
            this.setState({
                successful: false,
                message: "Please upload at least 1 cover image!"
            });
            return;
        }

        if (this.state.otherImages.length < 1) {
            this.setState({
                successful: false,
                message: "Please upload at least 1 item image!"
            });
            return;
        }

        if (this.state.otherImages.length > this.state.maxNumber) {
            this.setState({
                successful: false,
                message: "Exceeded maximum amount of images allowed (1 cover and 4 other images)!"
            });
            return;
        }

        const temp = [];
        temp.push(this.state.coverImage);
        this.state.otherImages.map(image => {
            temp.push(image);
        });

        // validate amount of cover images
        let coverCount = 0;
        temp.map(image => {
            if (image.file.cover) coverCount++;
        });

        if (coverCount > 1) {
            this.setState({
                successful: false,
                message: "Exceeded maximum amount of images allowed (1 cover and 4 other images)!"
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

            // create list of submitted files' is file cover index
            // to keep track which image is the item cover
            const coverIndexes = [];
            if (this.state.coverImage.file instanceof File) {
                coverIndexes.push(this.state.coverImage.file.cover);
            }
            this.state.otherImages.map((image) => {
                if (image.file instanceof File) {
                    coverIndexes.push(
                        image.file.cover
                    );
                }
            });

            // create list of newly uploaded image files
            const newImgList = [];
            if (this.state.coverImage.file instanceof File) {
                newImgList.push(this.state.coverImage.file);
            }
            this.state.otherImages.map(image => {
                if (image.file instanceof File) {
                    newImgList.push(image.file);
                }
            });

            const formData = new FormData();

            // add user id
            formData.append("userid", AuthService.getCurrentUser().id);

            // add item
            formData.append("item", JSON.stringify(item));

            // add cover indexes array
            formData.append("coverIndexes", JSON.stringify(coverIndexes));

            // add new files
            newImgList.map(file => {
                formData.append("files", file);
            });

            ItemService.createItem(
                formData
            ).then(
                response => {
                    // this.setState({
                    //     message: response.data.message,
                    //     successful: true
                    // });
                    this.props.history.push('/user/items');
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
            <div className = "page-container">
            <div className = "title">Edit Listing</div>
            <hr className="section-line" />
            <div className=" form white-container">
                <Form onSubmit={this.handleRegister} ref={c => { this.form = c; }}>

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
                            <Select
                                id="type"
                                name="type"
                                className="Input Item-type-input"
                                value={this.state.type}
                                onChange={this.onChangeType}
                                validations={[required]}
                            >
                                <option value="">Choose item category</option>
                                <option>Refrigerated/Processed food</option>
                                <option>Seafood/Dried fish</option>
                                <option>Vegetables/Fruits</option>
                                <option>Instant food</option>
                                <option>Spices/Condiments</option>
                                <option>Rice/Nuts</option>
                                <option>Canned food</option>
                                <option>Snacks</option>
                            </Select>
                        </div>
                        <div className="Flex-row-item">
                            <Input
                                id="quantity"
                                name="quantity"
                                className="Input Item-qty-input"
                                type="number" min="1" max="999"
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
                            <Select
                                id="for-item-type"
                                name="for-item-type"
                                className="Input Item-type-input Same-row"
                                type="text"
                                placeholder="Item type"
                                value={this.state.forItemType}
                                onChange={this.onChangeForItemType}
                                validations={[required]}
                            >
                                <option value="">Choose item category</option>
                                <option>Refrigerated/Processed food</option>
                                <option>Seafood/Dried fish</option>
                                <option>Vegetables/Fruits</option>
                                <option>Instant food</option>
                                <option>Spices/Condiments</option>
                                <option>Rice/Nuts</option>
                                <option>Canned food</option>
                                <option>Snacks</option>
                            </Select>
                        </div>
                        <div className="Flex-row-item">
                            <Input
                                id="for-item-quantity"
                                name="for-item-quantity"
                                className="Input Item-qty-input Same-row"
                                type="number" min="1" max="999"
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
                                    <div style={{ color: "red" }}>
                                        {errors.acceptType && <span>The selected file type is not allow!</span>}
                                        {errors.maxFileSize && <span>Selected file size exceed {this.state.maxFileSize / 1000000}MB!</span>}
                                        {errors.resolution && <span>Selected file exceeded maximum allowed resolution ({this.state.maxWidth}px * {this.state.maxHeight}px)</span>}
                                        <br />
                                    </div>)}

                                {!this.state.coverImage ?
                                    <button
                                        className="ImageUploadBox"
                                        type="button"
                                        style={isDragging ? { fontWeight: 'bold', color: "red" } : null}
                                        onClick={onImageUpload}
                                        {...dragProps}
                                    >
                                        {isDragging ? "Drop to upload" : (<div>Click or drop here to upload image</div>)}
                                    </button>
                                    : this.state.coverImage &&
                                    (
                                        <div className="container ImagePanels">
                                            <img src={this.state.coverImage.data_url} alt={this.state.coverImage.file.name} />
                                            <button type="button" onClick={() => onImageUpdate()}>Update</button>
                                            <button type="button" onClick={() => { onImageRemove(); this.onCoverImageRemove() }} className="Remove-btn">Remove</button>
                                            <p>{this.state.coverImage.file.name}</p>
                                        </div>
                                    )
                                }
                            </div>
                        )}
                    </ImageUploading>

                    <hr />

                    <ImageUploading
                        multiple
                        value={this.state.otherImages}
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
                                    <div style={{ color: "red" }}>
                                        {errors.maxNumber && <span>Exceeded maximum upload amount ({this.state.maxNumber})!</span>}
                                        {errors.acceptType && <span>The selected file type is not allow!</span>}
                                        {errors.maxFileSize && <span>Selected file size exceed {this.state.maxFileSize / 1000000}MB!</span>}
                                        {errors.resolution && <span>Selected file exceeded maximum allowed resolution ({this.state.maxWidth}px * {this.state.maxHeight}px)</span>}
                                        <br />
                                    </div>)}

                                {(this.state.otherImages.length < this.state.maxNumber) && (
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
                                {this.state.otherImages.map((image, index) =>
                                    !image.file.cover &&
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

                <br /><br /><br />

                <div>
                    <h1 className="Big-text">Preview of listing</h1>
                    <h3>Show preview down here, preview will look like what it will look like on the actual listing page.</h3>
                </div>
                </div>
            </div>
        );
    }
}
