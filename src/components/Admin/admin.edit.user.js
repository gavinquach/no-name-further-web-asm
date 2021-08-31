import React, { Component } from 'react';
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import Select from "react-validation/build/select";
import CheckButton from "react-validation/build/button";
import { isEmail } from "validator";



import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";

const required = value => {
    if (!value) {
        return (
            <div className="alert alert-danger" role="alert">
                This field is required!
            </div>
        );
    }
};

const email = value => {
    if (!isEmail(value)) {
        return (
            <div className="alert alert-danger" role="alert">
                This is not a valid email.
            </div>
        );
    }
};

const vusername = value => {
    if (value.length < 3 || value.length > 20) {
        return (
            <div className="alert alert-danger" role="alert">
                The username must be between 3 and 20 characters.
            </div>
        );
    }
};

const vpassword = value => {
    if (value.length != 0 && (value.length < 6 || value.length > 40)) {
        return (
            <div className="alert alert-danger" role="alert">
                The password must be between 6 and 40 characters.
            </div>
        );
    }
};

const requiredNewPassword = value => {
    if (document.getElementById('newpassword').value.length != 0 && !value) {
        return (
            <div className="alert alert-danger" role="alert">
                This field is required!
            </div>
        );
    }
};

const showButton = () => {
    let delButtons = document.getElementsByClassName("delete-button-container");
    for (let i = 0; i < delButtons.length; i++) {
        let delButtonOpen = delButtons[i];
        delButtonOpen.classList.toggle("show");
    }
}

const vphone = value => {
    let phone_regex = /^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;
    if (phone_regex.test(value) == false) {
        return (
            <div className="alert alert-danger" role="alert">
                Wrong phone number format!
            </div>
        );
    }
};

export default class AdminEditUser extends Component {
    constructor(props) {
        super(props);
        this.handleRegister = this.handleRegister.bind(this);
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangeNewPassword = this.onChangeNewPassword.bind(this);
        this.onChangeConfirmNewPassword = this.onChangeConfirmNewPassword.bind(this);
        this.onChangePhone = this.onChangePhone.bind(this);
        this.onChangeLocation = this.onChangeLocation.bind(this);
        this.onChangeDistrict = this.onChangeDistrict.bind(this);

        this.state = {
            data: [],
            vnLocations: [],
            districts: [],
            username: "",
            email: "",
            phone: "",
            location: "",
            district: "",
            old_password: '',
            new_password: '',
            confirm_new_password: '',
            successful: false,
            message: ""
        }
    }

    delete = () => {
        if (window.confirm("Are you sure you want to delete user " + this.state.username + "?")) {
            UserService.deleteUser(this.props.match.params.id)
                .then(
                    response => {
                        this.setState({
                            message: response.data.message,
                            successful: true
                        });

                        // redirect to view item page after delete
                        this.props.history.push('/admin/view/user');
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

    // get user info and assign to input fields
    componentDidMount() {
        UserService.viewOneUser(this.props.match.params.id)
            .then(response => {
                let isUser = false;
                const role_names = [];
                response.data.roles.map(role => {
                    role_names.push(role.name);
                })

                if (role_names.indexOf("user") > -1) {
                    isUser = true;
                }
                !isUser && this.props.history.push("/admin/index");

                this.getVietnamGeoData();
                this.setState({
                    username: response.data.username,
                    email: response.data.email,
                    phone: response.data.phone,
                    location: response.data.location[0],
                    district: response.data.location[1]
                });
            }, error => {
                this.props.history.push("/admin/index");
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    getVietnamGeoData = () => {
        try {
            fetch('/vn-geo.json', {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })
                .then(response => response.json())
                .then(jsonData => {
                    this.setState({ data: jsonData.data }, () => this.getVietnamLocations());
                });
            // console.log("fetched vn location data");
        } catch (error) {
            console.error(error.message);
        }
    }

    getVietnamLocations = () => {
        const locationList = [];
        this.state.data.map(location => {
            if (location.type == "Thành phố Trung ương" || location.type == "Tỉnh") {
                locationList.push({
                    city: location.name.replace(location.type + " ", ""),
                    district:
                        location.level2s.map(dist => {
                            return dist.name;
                        })
                });
            }
        });

        locationList.sort((a, b) => a.city.localeCompare(b.city));
        locationList.map(location => {
            location.district.sort();
        });

        const districtList = [];
        locationList.map(location => {
            if (location.city == this.state.location) {
                location.district.map(name => {
                    districtList.push(name);
                })
            }
        });

        this.setState({
            vnLocations: locationList,
            districts: districtList
        });
    }

    onChangeUsername = (e) => {
        this.setState({
            username: e.target.value
        });
    }

    onChangeEmail = (e) => {
        this.setState({
            email: e.target.value
        });
    }

    onChangePhone = (e) => {
        this.setState({
            phone: e.target.value
        });
    }

    onChangeLocation = (e) => {
        this.setState({
            location: e.target.value
        });

        const districtList = [];
        this.state.vnLocations.map(location => {
            if (location.city == e.target.value) {
                location.district.map(name => {
                    districtList.push(name);
                })
            }
        });
        this.setState({
            districts: districtList,
            district: ""
        });
    }

    onChangeDistrict = (e) => {
        this.setState({
            district: e.target.value
        });
    }

    onChangeNewPassword = (e) => {
        this.setState({
            newpassword: e.target.value
        });
    }

    onChangeConfirmNewPassword = (e) => {
        this.setState({
            confirm_new_password: e.target.value
        });
    }

    handleRegister = (e) => {
        e.preventDefault();

        this.setState({
            message: "",
            successful: false
        });

        this.form.validateAll();

        if (this.checkBtn.context._errors.length === 0) {
            UserService.editUser(
                this.props.match.params.id,
                this.state.username,
                this.state.email,
                this.state.phone,
                [this.state.location, this.state.district],
                this.state.confirm_new_password
            ).then(
                response => {
                    this.setState({
                        message: response.data.message,
                        successful: true
                    });

                    // // redirect to index page after update
                    // this.props.history.push('/user/index');
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
              
                <a href="/admin/view/user" style={{ marginLeft: "15em" }}>
                    <button className="Redirect-btn">View users</button>
                </a>
                <div className="container" style={{ width: "30em" }}>
                    <Form onSubmit={this.handleRegister} ref={c => { this.form = c; }}>
                        <h1 className="Big-text">Edit User</h1>
                        <br />
                        <Input
                            id="username"
                            name="username"
                            className="Input"
                            type="text"
                            placeholder="Username"
                            value={this.state.username}
                            onChange={this.onChangeUsername}
                            validations={[required, vusername]}>
                        </Input>

                        <Input
                            id="email"
                            name="email"
                            className="Input"
                            type="text"
                            placeholder="Email"
                            value={this.state.email}
                            onChange={this.onChangeEmail}
                            validations={[required, email]}>
                        </Input>

                        <Input
                            id="phone"
                            name="phone"
                            className="Input"
                            type="text"
                            value={this.state.phone}
                            onChange={this.onChangePhone}
                            validations={[required, vphone]}
                            placeholder="Phone number" />

                        <Select
                            id="location"
                            name="location"
                            className="Input"
                            value={this.state.location}
                            onChange={this.onChangeLocation}
                            validations={[required]}>
                            <option value="">Choose city</option>
                            {
                                this.state.vnLocations.map(location =>
                                    <option key={location.city}>{location.city}</option>
                                )
                            }
                        </Select>

                        <Select
                            id="district"
                            name="district"
                            className="Input"
                            value={this.state.district}
                            onChange={this.onChangeDistrict}
                            validations={[required]}>
                            <option value="">Choose district</option>
                            {
                                this.state.districts.map(name =>
                                    <option key={name}>{name}</option>
                                )
                            }
                        </Select>

                        <Input
                            id="newpassword"
                            name="newpassword"
                            className="Input"
                            type="password"
                            placeholder="New Password"
                            value={this.state.newpassword}
                            onChange={this.onChangeNewPassword}
                            validations={[vpassword]}>
                        </Input>

                        <Input
                            id="confirm-new-password"
                            name="confirm-new-password"
                            className="Input"
                            type="password"
                            placeholder="Confirm New Password"
                            value={this.state.confirm_new_password}
                            onChange={this.onChangeConfirmNewPassword}
                            validations={[requiredNewPassword, vpassword]}>
                        </Input>

                        <button className="Create-btn">Update user</button>

                        {this.state.message && (
                            <div className="form-group">
                                <div className={this.state.successful ? "alert alert-success" : "alert alert-danger"} role="alert">
                                    {this.state.message}
                                </div>
                            </div>
                        )}
                        <CheckButton style={{ display: "none" }} ref={c => { this.checkBtn = c; }} />
                    </Form>

                    {(this.props.match.params.id != AuthService.getCurrentUser().id &&
                        (AuthService.isRoot() || (AuthService.getRoles().includes("ROLE_EDIT_USER") && AuthService.getRoles().includes("ROLE_DELETE_USER"))))
                        && (
                            <div>
                                <hr />
                                <br />
                                <div className="danger-zone-container">
                                    <button type="button" className="danger-zone-btn" id="dropdown" onClick={() => showButton()}>
                                        <div className="danger-text-div">
                                            <h4 className="pull-left danger-text">Danger zone</h4>
                                        </div>
                                    </button>
                                    <div className="hide delete-button-container">
                                        <button type="button" onClick={() => this.delete()} className="delete-button">
                                            Delete user
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        )
    }
}