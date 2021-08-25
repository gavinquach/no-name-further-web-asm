import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import Select from "react-validation/build/select";
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

export default class UserCreateItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            acceptImageType: ['jpg', 'jpeg', 'png'],
            maxNumber: 4,
            maxFileSize: 5000000,
            resolutionType: "less",
            maxWidth: 1920,
            maxHeight: 1920,
            name: "",
            quantity: 0,
            type: "",
            images: [],
            forItemName: "",
            forItemQty: 0,
            forItemType: "",
            hasCoverImg: false,
            successful: false,
            message: "",
        };
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
        const list = [];
        imageList.map(image => {
            image.file.cover = (typeof image.file.cover === "undefined" || !image.file.cover) ? false : true;
            list.push({
                data_url: image.data_url,
                file: image.file
            })
        });

        this.setState({ images: list });
    };

    onChangeUploadCoverImage = (imageList, index) => {
        // has other images in image list
        if (imageList.length > 1) {
            // index is a value which means user updated cover image
            if (index) {
                // remove the old cover image
                imageList.map((image, i) => {
                    if (image.file.cover) {
                        imageList.splice(i, 1);
                    }
                });

                // add cover parameter to newly added 
                // image and set it to true
                if (index == imageList.length) {
                    imageList[index - 1].file.cover = true;
                } else {
                    imageList[index].file.cover = true;
                }
            }

            // re-add all images with proper data
            const temp = [];
            imageList.map(image => {
                image.file.cover = (typeof image.file.cover === "undefined" || !image.file.cover) ? false : true;
                temp.push({
                    data_url: image.data_url,
                    file: image.file
                });
            });

            this.setState({
                hasCoverImg: true,
                maxNumber: 5,
                images: temp,
            });
        }
        // no other images in image list
        else {
            const temp = this.state.images;

            // remove old cover image
            temp.map((image, index) => {
                if (image.file.cover) temp.splice(index, 1);
            });

            // re-add image with proper data
            imageList.map(image => {
                image.file.cover = true;
                temp.push({
                    data_url: image.data_url,
                    file: image.file
                })
            });

            this.setState({
                hasCoverImg: true,
                maxNumber: 5,
                images: temp
            });
        }
    };

    handleRegister = (e) => {
        e.preventDefault();

        this.form.validateAll();
        
        let count = 0;
        this.state.images.map((image) => {
            if (image.file.cover) count++;
        })
        if (count > 1) {
            this.setState({
                successful: false,
                message: "Invalid amount of cover images!"
            });
            return;
        }

        if (!this.state.hasCoverImg) {
            this.setState({
                successful: false,
                message: "Cover image required!"
            });
            return;
        }

        if (this.state.images.length == 0) {
            this.setState({
                successful: false,
                message: "Please upload at least 1 image!"
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

            // to keep track which image is the item cover
            const coverIndexes = [];
            this.state.images.map((image) => {
                coverIndexes.push(
                    image.file.cover
                );
            })

            const formData = new FormData();
            this.state.images.map(image =>
                formData.append("files", image.file)
            );
            formData.append("userid", AuthService.getCurrentUser().id);
            for (let key in item) {
                formData.append(key, item[key]);
            }

            coverIndexes.map(index =>
                formData.append("coverIndexes", index)
            );

            const config = {
                headers: {
                    'content-type': 'multipart/form-data'
                }
            };

            AuthService.createItem(
                formData,
                config
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
            <div>
                <NavigationBar />
                <Form className="container" style={{ width: "60em" }} onSubmit={this.handleRegister} ref={c => { this.form = c; }}>
                    <h1 className="Big-text">Create item</h1>
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
                                <option>Snack</option>
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
                                <option>Snack</option>
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
                                        image.file.cover &&
                                        (
                                            <div key={index} className="container ImagePanels">
                                                <img src={image.data_url} alt={image.file.name} />
                                                <button type="button" onClick={() => onImageUpdate(index)}>Update</button>
                                                <button type="button" onClick={() => { onImageRemove(index); this.removeCoverImg(); }} className="Remove-btn">Remove</button>
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
                                        {errors.maxNumber && <span>Exceeded maximum upload amount ({!this.state.hasCoverImg ? this.state.maxNumber : this.state.maxNumber - 1})!</span>}
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

                <div className="container" style={{ width: "60em" }}>
                    <h1 className="Big-text">Preview of listing</h1>
                    <h3>Show preview down here, preview will look like what it will look like on the actual listing page.</h3>
                </div>
            </div>
        );
    }
}
