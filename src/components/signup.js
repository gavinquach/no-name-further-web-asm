import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import Select from "react-validation/build/select";
import CheckButton from "react-validation/build/button";
import { isEmail } from "validator";
import {Helmet} from "react-helmet";

import AuthService from "../services/auth.service";
import UserService from "../services/user.service";

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
    if (value.length < 6 || value.length > 40) {
        return (
            <div className="alert alert-danger" role="alert">
                The password must be between 6 and 40 characters.
            </div>
        );
    }
    
    // allow lowercase alphanumeric, dash, and underscore for username only
    const regex = /^([a-z0-9-_\u0600-\u06FF\u0660-\u0669\u06F0-\u06F9 _.-]+)$/
    if (!regex.test(value)) {
        return (
            <div className="alert alert-danger" role="alert">
                Username must be lowercase alphanumeric with dash or underscore only.
            </div>
        );
    }

    // don't allow white space
    if (/\s/g.test(value)) {
        return (
            <div className="alert alert-danger" role="alert">
                Whitespace is not allowed in username.
            </div>
        );
    }
};

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

const hideDistrictField = () => {
    const container = document.getElementsByClassName("district-hide-container");
    for (let i = 0; i < container.length; i++) {
        let delButtonOpen = container[i];
        delButtonOpen.classList.remove("show");
    }
}

const showDistrictField = () => {
    const container = document.getElementsByClassName("district-hide-container");
    for (let i = 0; i < container.length; i++) {
        let delButtonOpen = container[i];
        delButtonOpen.classList.add("show");
    }
}

export default class Signup extends Component {
    constructor(props) {
        super(props);
        this.handleRegister = this.handleRegister.bind(this);
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangePhone = this.onChangePhone.bind(this);
        this.onChangeLocation = this.onChangeLocation.bind(this);
        this.onChangeDistrict = this.onChangeDistrict.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);

        this.state = {
            data: [],
            vnLocations: [],
            districts: [],
            username: "",
            email: "",
            phone: "",
            location: "",
            district: "",
            password: "",
            successful: false,
            message: "",
            disableSend: false,
            resendMessage: ""
        };
    }

    componentDidMount() {
        window.scrollTo(0, 0); // automatically scroll to top
        this.getVietnamGeoData();
    }

    getVietnamGeoData() {
        try {
            fetch('vn-geo.json', {
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

    getVietnamLocations() {
        let locationList = [];
        this.state.data.map(location => {
            if (location.type == "Th??nh ph??? Trung ????ng" || location.type == "T???nh") {
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

        this.setState({ vnLocations: locationList });
    }

    onChangeUsername(e) {
        this.setState({
            username: e.target.value
        });
    }

    onChangeEmail(e) {
        this.setState({
            email: e.target.value
        });
    }

    onChangePhone(e) {
        this.setState({
            phone: e.target.value
        });
    }

    onChangeLocation(e) {
        this.setState({
            location: e.target.value
        });
        if (e.target.value === "") {
            hideDistrictField();
        }
        else {
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
            showDistrictField()
        }
    }

    onChangeDistrict(e) {
        this.setState({
            district: e.target.value
        });
    }

    onChangePassword(e) {
        this.setState({
            password: e.target.value
        });
    }

    sendEmail = () => {
        if (!this.state.disableSend) {
            AuthService.sendVerifyEmail(
                this.state.username,
                this.state.password
            ).then(response => {
                console.log(response.data.resendMessage);
                this.setState({
                    resendMessage: "Email sent, you will be able to resend again in 2 minutes."
                });
            }, error => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();

                this.setState({
                    loading: false,
                    message: resMessage
                });
            }
            );
            this.setState({
                disableSend: true
            }, () => {
                // re-enable link after 2 minutes
                setTimeout(() => {
                    this.setState({
                        disableSend: false,
                        resendMessage: ""
                    });
                }, 120 * 1000);
            });
        }
    }

    handleRegister(e) {
        e.preventDefault();

        this.setState({
            message: "",
            successful: false
        });

        this.form.validateAll();

        if (this.checkBtn.context._errors.length === 0) {
            const user = {
                username: this.state.username,
                email: this.state.email,
                phone: this.state.phone,
                location: [this.state.location, this.state.district],
                password: this.state.password
            };
            UserService.register(user)
                .then(
                    response => {
                        this.setState({
                            message: response.data.message,
                            successful: true
                        });
                        // setTimeout(() => {
                        //     AuthService.login(this.state.username, this.state.password)
                        //         .then(
                        //             // () => {
                        //             //     this.props.history.push("/");
                        //             // },
                        //             error => {
                        //                 const resMessage =
                        //                     (error.response &&
                        //                         error.response.data &&
                        //                         error.response.data.message) ||
                        //                     error.message ||
                        //                     error.toString();

                        //                 this.setState({
                        //                     loading: false,
                        //                     message: resMessage
                        //                 });
                        //             }
                        //         );
                        // }, 3000);
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
        if (AuthService.isLoggedIn()) {
            return <Redirect to="/" />
        }
        return (
            <div className ="page-container">
                <Helmet>
                    <title>Sign Up</title>
                </Helmet>
                <div className="title">Register</div>
                <hr className="section-line" />
                <div className = "form white-container">
                <Form className="container" style={{ width: "30em",  marginTop: '7em', marginBottom: '7em' }} onSubmit={this.handleRegister} ref={c => { this.form = c; }}>
                    
                    <br></br>
                    <Input
                        id="username"
                        name="username"
                        className="Input"
                        type="text"
                        value={this.state.username}
                        onChange={this.onChangeUsername}
                        validations={[required, vusername]}
                        placeholder="Username" />

                    <Input
                        id="email"
                        name="email"
                        className="Input"
                        type="text"
                        value={this.state.email}
                        onChange={this.onChangeEmail}
                        validations={[required, email]}
                        placeholder="Email address" />

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
                        onChange={this.onChangeLocation}
                        validations={[required]}>
                        <option value="">Choose your city</option>
                        {
                            this.state.vnLocations.map(location =>
                                <option key={location.city}>{location.city}</option>
                            )
                        }
                    </Select>

                    <div className="hide district-hide-container">
                        <Select
                            id="district"
                            name="district"
                            className="Input"
                            value={this.state.district}
                            onChange={this.onChangeDistrict}
                            validations={[required]}>
                            <option value="">Choose your district</option>
                            {
                                this.state.districts.map(name =>
                                    <option key={name}>{name}</option>
                                )
                            }
                        </Select>
                    </div>

                    <Input
                        id="password"
                        name="password"
                        className="Input"
                        type="password"
                        value={this.state.password}
                        onChange={this.onChangePassword}
                        validations={[required, vpassword]}
                        placeholder="Password" />

                    {(this.state.message && this.state.successful) && (
                        <span>
                            <span
                                id={this.state.disableSend ? "send-email-text-disabled" : "send-email-text"}
                                onClick={this.sendEmail}>
                                Resend email
                            </span>
                            <br />
                        </span>
                    )}

                    {this.state.resendMessage && (
                        <span style={{ color: 'blue', float: 'right' }}>{this.state.resendMessage}</span>
                    )}

                    <button className="Create-btn">
                        Sign up
                    </button>

                    {this.state.message && (
                        <div className="form-group">
                            <div className={this.state.successful ? "alert alert-success" : "alert alert-danger"}
                                role="alert">
                                {this.state.message}
                            </div>
                        </div>
                    )}
                    <CheckButton style={{ display: "none" }} ref={c => { this.checkBtn = c; }} />

                    <p>By signing up you agree to the <Link style={{ textDecoration: 'underline' }} to="#">terms of service</Link>.</p>
                </Form>
            </div>
            </div>
        );
    }
}