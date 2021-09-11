import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import Select from "react-validation/build/select";
import CheckButton from "react-validation/build/button";
import { isEmail } from "validator";
import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";

import '../../css/Profile.css';

const required = value => {
    if (!value) {
        return (
            <div style={{ marginTop: '0.5em' }} className="alert alert-danger" role="alert">
                This field is required!
            </div>
        );
    }
};

const requiredInline = value => {
    if (!value) {
        return (
            <div style={{ display: 'inline', marginLeft: '1em' }} className="alert alert-danger" role="alert">
                This field is required!
            </div>
        );
    }
};

const email = value => {
    if (!isEmail(value)) {
        return (
            <div style={{ display: 'inline', marginLeft: '1em' }} className="alert alert-danger" role="alert">
                This is not a valid email.
            </div>
        );
    }
};

const vphone = value => {
    let phone_regex = /^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;
    if (phone_regex.test(value) == false) {
        return (
            <div style={{ display: 'inline', marginLeft: '1em' }} className="alert alert-danger" role="alert">
                Wrong phone number format!
            </div>
        );
    }
};

export default class UserProfile extends Component {
    constructor(props) {
        super(props);
        this.handleRegister = this.handleRegister.bind(this);
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
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
            successful: false,
            message: ""
        };
    }

    // get user info and assign to input fields
    componentDidMount() {
        UserService.viewOneUser(AuthService.getCurrentUser().id)
            .then(
                response => {
                    this.getVietnamGeoData();
                    this.setState({
                        username: response.data.username,
                        email: response.data.email,
                        phone: response.data.phone,
                        location: response.data.location[0],
                        district: response.data.location[1]
                    });
                })
            .catch((error) => {
                if (error.response && error.response.status != 500) {
                    console.log(error.response.data.message);
                } else {
                    console.log(error);
                }
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

    handleRegister = (e) => {
        e.preventDefault();

        this.setState({
            message: "",
            successful: false
        });

        this.form.validateAll();

        if (this.checkBtn.context._errors.length === 0) {
            UserService.editInfo(
                AuthService.getCurrentUser().id,
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
        // const currentUser = AuthService.getCurrentUser();
        return (
            <div>
                <div className="title">My profile</div>
                <hr className="section-line" />
                <div className="form white-container">
                    <Form onSubmit={this.handleRegister} ref={c => { this.form = c; }}>
                        <div className="labels">
                            <label className="label row"> Username: </label>
                            <label className="label row"> Email: </label>
                            <label className="label row"> Phone number: </label>
                            <label className="label row"> Location: </label>
                        </div>
                        <div>
                            <span className="prow">
                                <div id="profile-name">
                                    {this.state.username}
                                </div>
                            </span>
                            <span className="prow">
                                <Input
                                    id="email"
                                    name="email"
                                    className="profile-input"
                                    type="text"
                                    placeholder="Email"
                                    value={this.state.email}
                                    onChange={this.onChangeEmail}
                                    validations={[requiredInline, email]}>
                                </Input>
                            </span>
                            <span className="prow">
                                <Input
                                    id="phone"
                                    name="phone"
                                    className="profile-input"
                                    type="text"
                                    value={this.state.phone}
                                    onChange={this.onChangePhone}
                                    validations={[requiredInline, vphone]}
                                    placeholder="Phone number" />
                            </span>
                            <span className="location-row">
                                <Select
                                    id="location"
                                    name="location"
                                    className="profile-input"
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
                                    id="district-select"
                                    name="district"
                                    className="profile-input"
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
                            </span>
                        </div>

                        <button className="Create-btn">Save</button>

                        {this.state.message && (
                            <h5 className={this.state.successful ? "update-msg success" : "update-msg fail"} role="alert">
                                {this.state.message}
                            </h5>
                        )}
                        <CheckButton style={{ display: "none" }} ref={c => { this.checkBtn = c; }} />
                    </Form>
                </div>
                {/* <p>
                        <strong>Token:</strong>{" "}
                        {currentUser.accessToken.substring(0, 20)} ...{" "}
                        {currentUser.accessToken.substr(currentUser.accessToken.length - 20)}
                    </p> 
                    
                    // show roles for admins only
                    {AuthService.isAdmin() &&
                        <p><strong>Roles: </strong>
                            {currentUser.roles &&
                                currentUser.roles.map((role, index) => (
                                    index == currentUser.roles.length - 1 ? role : role + ", "
                                ))}
                        </p>
                    } */}
            </div>
        );
    }
}