import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import Select from "react-validation/build/select";
import CheckButton from "react-validation/build/button";
import ImageUploading from "react-images-uploading";    // npm install --save react-images-uploading
import { Helmet } from "react-helmet";
import { Editor } from 'react-draft-wysiwyg';
import { convertToRaw, convertFromRaw, EditorState } from 'draft-js';
import { Redirect } from "react-router-dom";
import AuthService from "../../services/auth.service";
import ItemService from "../../services/item.service";

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import '../../css/UserPages.css'

import ItemDetails from "../Item/item.details";

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
            maxWidth: 5000,
            maxHeight: 5000,
            name: "",
            quantity: 0,
            type: "",
            oldImgList: [],
            coverImage: null,
            otherImages: [],
            forItemName: "",
            forItemQty: 0,
            forItemType: "",
            seller: null,
            successful: false,
            message: "",
            editorState: EditorState.createEmpty()
        };
    }

    // get user info and assign to input fields
    componentDidMount() {
        window.scrollTo(0, 0); // automatically scroll to top
        this.load();
    }

    load = () => {
        ItemService.viewOneItem(this.props.match.params.id)
            .then(response => {
                if (response.data.description) {
                    const contentState = convertFromRaw(JSON.parse(response.data.description));
                    const editorState = EditorState.createWithContent(contentState);
                    this.setState({
                        editorState: editorState
                    });
                }

                this.setState({
                    name: response.data.name,
                    quantity: response.data.quantity,
                    type: response.data.type.name,
                    forItemName: response.data.forItemName,
                    forItemQty: response.data.forItemQty,
                    forItemType: response.data.forItemType.name,
                    oldImgList: response.data.images,
                    seller: response.data.seller
                }, () => this.addImages());
            }).catch((error) => {
                // item not found
                if (error.response && error.response.status == 404) {
                    console.log(error.response.data.message);
                    this.props.history.push("/user/items");
                } else if (error.response && error.response.status != 500) {
                    console.log(error.response.data.message);
                } else {
                    console.log(error);
                }
            });
    }

    addImages = () => {
        const imgList = [];
        this.state.oldImgList.map(image => {
            if (image.cover) {
                this.setState({
                    coverImage: {
                        data_url: process.env.REACT_APP_NODEJS_URL.concat("images/", image.name),
                        file: {
                            name: image.name,
                            size: image.size,
                            type: image.type,
                            cover: image.cover
                        }
                    }
                });
            } else {
                imgList.push({
                    data_url: process.env.REACT_APP_NODEJS_URL.concat("images/", image.name),
                    file: {
                        name: image.name,
                        size: image.size,
                        type: image.type,
                        cover: image.cover
                    }
                });
            }
        });

        this.setState({ otherImages: imgList });
    }

    delete = () => {
        if (window.confirm("Are you sure you want to delete this listing?")) {
            ItemService.deleteItem(this.props.match.params.id)
                .then((response) => {
                    if (response.status == 200 || response.status == 201) {
                        this.setState({
                            message: response.data.message,
                            successful: true
                        });
                        // redirect to view item page after delete
                        this.props.history.push('/user/items');
                    } else {
                        this.setState({
                            message: response.data.message,
                            successful: false
                        });
                    }
                }).catch((error) => {
                    // item not found
                    if (error.response && error.response.status != 500) {
                        this.setState({
                            message: error.response.data.message,
                            successful: false
                        });
                    } else {
                        this.setState({
                            message: `${error.response.status} ${error.response.statusText}`,
                            successful: false
                        });
                    }
                });
        }
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

    onEditorStateChange = (editorState) => {
        this.setState({
            editorState,
        });
    };

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
            const contentState = this.state.editorState.getCurrentContent();
            const rawContent = JSON.stringify(convertToRaw(contentState));

            // need to upload item then images can be uploaded with this item id
            const item = {
                name: this.state.name,
                quantity: this.state.quantity,
                type: this.state.type,
                forItemName: this.state.forItemName,
                forItemQty: this.state.forItemQty,
                forItemType: this.state.forItemType,
                description: rawContent
            };

            // create list of removed images
            // by checking if the oldImgList list has the 
            // current images and remove them, leaving only the old ones
            const temp = [];
            temp.push(this.state.coverImage.file.name);
            this.state.otherImages.map(image => {
                temp.push(image.file.name);
            });
            const removedImgList = this.state.oldImgList.filter((image) => !temp.includes(image.name));

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

            // add old images list
            formData.append("removedImages", JSON.stringify(removedImgList));

            // add cover indexes array
            formData.append("coverIndexes", JSON.stringify(coverIndexes));

            // add new files
            newImgList.map(file => {
                formData.append("files", file);
            });

            ItemService.editItem(
                this.props.match.params.id,
                formData
            ).then(
                response => {
                    this.setState({
                        message: response.data.message,
                        successful: true
                    });
                    this.load();
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
        if (this.state.seller && this.state.seller._id != AuthService.getCurrentUser().id) {
            return <Redirect to="/notfound" />
        }
        let item = null;
        if (this.state.coverImage || this.state.otherImages.length > 0) {
            // convert description to string
            const contentState = this.state.editorState.getCurrentContent();
            const rawContent = JSON.stringify(convertToRaw(contentState));
            const images = [];
            if (this.state.coverImage) {
                images.push(this.state.coverImage);
            }
            this.state.otherImages.map(image => {
                images.push(image);
            });
            item = {
                name: this.state.name,
                quantity: this.state.quantity,
                type: this.state.type,
                forItemName: this.state.forItemName,
                forItemQty: this.state.forItemQty,
                forItemType: this.state.forItemType,
                seller: this.state.seller,
                images: images,
                description: rawContent
            };
        }

        return (
            <div className="page-container">
                <Helmet>
                    <title>Edit Listing</title>
                </Helmet>
                <div className="title">Edit Listing</div>
                <hr className="section-line" />
                <div>
                    <Form onSubmit={this.handleRegister} ref={c => { this.form = c; }}>
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

                        <h2>Item description:</h2>
                        <div>
                            <Editor
                                wrapperClassName="DescriptionWrapper"
                                editorClassName="DescriptionEditor"
                                editorState={this.state.editorState}
                                onEditorStateChange={this.onEditorStateChange}
                            />
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

                    <h1 className="Big-text">Delete listing</h1>
                    <button type="button" onClick={() => this.delete()} className="delete-item-button-single">
                        Delete listing
                    </button>

                    <hr />

                    <br /><br /><br />

                    <div>
                        <h1 className="Big-text">Preview of listing</h1>
                        {(item && item.images) && (
                            <span>
                                <h3>Your item will look like this on the item details page.</h3>
                                <ItemDetails obj={item} />
                            </span>
                        )}
                    </div>

                    <br /><br /><br />
                </div>
            </div>
        );
    }
}
