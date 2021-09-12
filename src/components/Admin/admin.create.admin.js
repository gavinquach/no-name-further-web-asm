import React, { Component } from 'react';
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import Select from "react-validation/build/select";
import CheckButton from "react-validation/build/button";
import { isEmail } from "validator";
import { Link, Redirect } from 'react-router-dom'

import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";

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

export default class AdminCreateAdmin extends Component {
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
            username: '',
            email: '',
            phone: "",
            location: "",
            district: "",
            password: '',
            roles: [],
            successful: false,
            message: "",
            checkedState: new Array(12).fill(false)
        }
    }

    componentDidMount() {
        this.getVietnamGeoData();
    }

    getVietnamGeoData() {
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

    getVietnamLocations() {
        let locationList = [];
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

        this.setState({ vnLocations: locationList });
    }

    // enable multiple checkboxes to be checked
    handleOnChange = (position) => {
        const updatedCheckedState = this.state.checkedState.map((item, index) =>
            index === position ? !item : item
        );

        this.setState({ checkedState: updatedCheckedState });
    };

    updateCheckBox = (start, stop) => {
        const updatedCheckedState = this.state.checkedState;
        if (updatedCheckedState[start]) {
            for (let i = start; i <= stop; i++) {
                updatedCheckedState[i] = false;
            }
        } else {
            for (let i = start; i <= stop; i++) {
                updatedCheckedState[i] = true;
            }
        }

        this.setState({ checkedState: updatedCheckedState });
    };

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

    onChangePassword = (e) => {
        this.setState({
            password: e.target.value
        });
    }

    handleRegister = (e) => {
        e.preventDefault();

        this.setState({
            message: "",
            successful: false
        });

        let roles = document.getElementsByName("roles[]");
        let roles_submit = [];
        roles.forEach((item) => {
            if (item.checked) {
                roles_submit.push(item.value);
            }
        });

        // no roles chosen
        if (roles_submit.length == 0) {
            this.setState({
                message: "Please add at least 1 role!",
                successful: false
            });
            return;
        }
        // max length, meaning all roles are chosen, put root only
        else if (roles_submit.length == roles.length) {
            roles_submit = ["root"];
        }

        this.form.validateAll();

        if (this.checkBtn.context._errors.length === 0) {
            const user = {
                username: this.state.username,
                email: this.state.email,
                phone: this.state.phone,
                location: [this.state.location, this.state.district],
                password: this.state.password,
                roles: roles_submit,
                verified: true
            };
            UserService.createUserWithRoles(user)
                .then((response) => {
                    if (response.data.status == 200) {
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
                }).catch((error) => {
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

    render() {
        // redirect to index page when unauthorized admin tries to view
        if (!AuthService.isRoot() && !AuthService.getRoles().includes("ROLE_CREATE_ADMIN")) {
            return <Redirect to='/admin/index' />
        }
        return (
            <div>
                <Link to="/admin/view/admin" style={{ marginLeft: "15em" }}>
                    <button className="Redirect-btn">View admins</button>
                </Link>
                <Form className="container" style={{ width: "30em" }} onSubmit={this.handleRegister} ref={c => { this.form = c; }}>
                    <h1 className="Big-text">Create admin</h1>
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
                        onChange={this.onChangeLocation}
                        validations={[required]}>
                        <option value="">Choose city</option>
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
                            <option value="">Choose district</option>
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
                        placeholder="Password"
                        value={this.state.password}
                        onChange={this.onChangePassword}
                        validations={[required, vpassword]}>
                    </Input>

                    <table className="role-table">
                        <tbody>
                            <tr>
                                <td colSpan="2" className="tableheader tablerow-root">Root Admin (Full Admin Access)</td>
                                <td className="tablerow-root">
                                    <Input
                                        type="checkbox"
                                        id="p0"
                                        onClick={() => this.updateCheckBox(0, 10)}
                                        checked={this.state.checkedState[0]}
                                    />
                                </td>
                            </tr>
                            <tr className="tableheader">
                                <td colSpan="2" className="tableheader">Manage Users</td>
                                <td className="tableheader">
                                    <Input
                                        type="checkbox"
                                        id="p1"
                                        onClick={() => this.updateCheckBox(1, 5)}
                                        checked={this.state.checkedState[1]}
                                    />
                                </td>
                            </tr>
                            <tr className="tablerow">
                                <td width="15%">&nbsp;</td>
                                <td className="tablerow">View Users</td>
                                <td className="tablerow">
                                    <Input
                                        type="checkbox"
                                        id="p2"
                                        name="roles[]"
                                        value="view_user"
                                        checked={this.state.checkedState[2]}
                                        onChange={() => this.handleOnChange(2)}
                                    />
                                </td>
                            </tr>
                            <tr className="tablerow">
                                <td width="15%">&nbsp;</td>
                                <td className="tablerow">Add New Users</td>
                                <td className="tablerow">
                                    <Input
                                        type="checkbox"
                                        id="p3"
                                        name="roles[]"
                                        value="create_user"
                                        checked={this.state.checkedState[3]}
                                        onChange={() => this.handleOnChange(3)}
                                    />
                                </td>
                            </tr>
                            <tr className="tablerow">
                                <td width="15%">&nbsp;</td>
                                <td className="tablerow">Edit Users</td>
                                <td className="tablerow">
                                    <Input
                                        type="checkbox"
                                        id="p4"
                                        name="roles[]"
                                        value="edit_user"
                                        checked={this.state.checkedState[4]}
                                        onChange={() => this.handleOnChange(4)}
                                    />
                                </td>
                            </tr>
                            <tr className="tablerow">
                                <td width="15%">&nbsp;</td>
                                <td className="tablerow">Delete Users</td>
                                <td className="tablerow">
                                    <Input
                                        type="checkbox"
                                        id="p5"
                                        name="roles[]"
                                        value="delete_user"
                                        checked={this.state.checkedState[5]}
                                        onChange={() => this.handleOnChange(5)}
                                    />
                                </td>
                            </tr>
                            <tr><td style={{ visibility: 'hidden' }}>a</td></tr>
                            <tr>
                                <td colSpan="2" className="tableheader">Manage Admins</td>
                                <td className="tableheader">
                                    <Input
                                        type="checkbox"
                                        id="p6"
                                        onClick={() => this.updateCheckBox(6, 10)}
                                        checked={this.state.checkedState[6]}
                                    />
                                </td>
                            </tr>
                            <tr className="tablerow">
                                <td width="15%">&nbsp;</td>
                                <td className="tablerow">View Admins</td>
                                <td className="tablerow">
                                    <Input
                                        type="checkbox"
                                        id="p7"
                                        name="roles[]"
                                        value="view_admin"
                                        checked={this.state.checkedState[7]}
                                        onChange={() => this.handleOnChange(7)}
                                    />
                                </td>
                            </tr>
                            <tr className="tablerow">
                                <td width="15%">&nbsp;</td>
                                <td className="tablerow">Add New Admins</td>
                                <td className="tablerow">
                                    <Input
                                        type="checkbox"
                                        id="p8"
                                        name="roles[]"
                                        value="create_admin"
                                        checked={this.state.checkedState[8]}
                                        onChange={() => this.handleOnChange(8)}
                                    />
                                </td>
                            </tr>
                            <tr className="tablerow">
                                <td width="15%">&nbsp;</td>
                                <td className="tablerow">Edit Admins</td>
                                <td className="tablerow">
                                    <Input
                                        type="checkbox"
                                        id="p9"
                                        name="roles[]"
                                        value="edit_admin"
                                        checked={this.state.checkedState[9]}
                                        onChange={() => this.handleOnChange(9)}
                                    />
                                </td>
                            </tr>
                            <tr className="tablerow">
                                <td width="15%">&nbsp;</td>
                                <td className="tablerow">Delete Admins</td>
                                <td className="tablerow">
                                    <Input
                                        type="checkbox"
                                        id="p10"
                                        name="roles[]"
                                        value="delete_admin"
                                        checked={this.state.checkedState[10]}
                                        onChange={() => this.handleOnChange(10)}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <button className="Create-btn">Create admin</button>

                    {this.state.message && (
                        <div className="form-group">
                            <div className={this.state.successful ? "alert alert-success" : "alert alert-danger"}
                                role="alert">
                                {this.state.message}
                            </div>
                        </div>
                    )}
                    <CheckButton style={{ display: "none" }} ref={c => { this.checkBtn = c; }} />
                </Form>
            </div>
        )
    }
}