import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import Select from "react-validation/build/select";
import CheckButton from "react-validation/build/button";
import { isEmail } from "validator";

import '../css/Profile.css'

import AuthService from "../services/auth.service";
import NavigationBar from "../NavigationBar";
import ProfileSideBar from "./ProfileSideBar"

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
            currentUser: AuthService.getCurrentUser(),
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
        this.setState({
            username: this.state.currentUser.username,
            email: this.state.currentUser.email,
            phone: this.state.currentUser.phone,
            location: this.state.currentUser.location[0],
            district: this.state.currentUser.location[1]
        });
        this.getVietnamGeoData();
    }

    getVietnamGeoData = () => {
        try {
            fetch("http://puu.sh/I27Xh/7c252db895.json")
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
            AuthService.editUser(
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
        const { currentUser } = this.state;
        return (
            <div>
                <NavigationBar />
                <div className="Flexbox">
                    <ProfileSideBar />
                    <div className="Right-content">
                        <h2 className="right-content-label">My profile</h2>
                        <Form onSubmit={this.handleRegister} ref={c => { this.form = c; }}>
                            <div className="labels">
                                <label className="label row"> Username: </label>
                                <label className="label row"> Email: </label>
                                <label className="label row"> Phone number: </label>
                                <label className="label row"> Location: </label>
                            </div>
                            <div>
                                <span className="row">
                                    <p>
                                        {currentUser.username}
                                    </p>
                                </span>
                                <span className="row">
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
                                <span className="row">
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
                                <span className="row">
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
            </div>
        );
    }
}