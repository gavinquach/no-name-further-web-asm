import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import Select from "react-validation/build/select";
import CheckButton from "react-validation/build/button";
import { isEmail } from "validator";

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

function showButton() {
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

export default class AdminEditAdmin extends Component {
    constructor(props) {
        super(props);
        this.handleRegister = this.handleRegister.bind(this);
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangeNewPassword = this.onChangeNewPassword.bind(this);
        this.onChangeConfirmNewPassword = this.onChangeConfirmNewPassword.bind(this);

        this.state = {
            data: [],
            vnLocations: [],
            districts: [],
            username: "",
            email: "",
            phone: "",
            location: "",
            district: "",
            new_password: '',
            confirm_new_password: '',
            roles: [],
            successful: false,
            message: "",
            checkedState: new Array(12).fill(false)
        }
    }

    delete = () => {
        if (window.confirm("Are you sure you want to delete admin " + this.state.username + "?")) {
            UserService.deleteUser(this.props.match.params.id)
                .then((response) => {
                    if (response.status == 200 || response.status == 201) {
                        this.setState({
                            message: response.data.message,
                            successful: true
                        });
                        // redirect to view item page after delete
                        this.props.history.push('/admin/view/admin');
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

    // get admin info and assign to input fields
    componentDidMount() {
        window.scrollTo(0, 0); // automatically scroll to top
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
                isUser && this.props.history.push("/admin/index");

                this.getVietnamGeoData();
                this.setState({
                    username: response.data.username,
                    email: response.data.email,
                    phone: response.data.phone,
                    location: response.data.location[0],
                    district: response.data.location[1],
                    roles: response.data.roles
                }, () => this.fillCheckBoxes());
            })
            .catch((error) => {
                if (error.response && error.response.status != 500) {
                    console.log(error.response.data.message);
                } else {
                    console.log(error);
                }
                this.props.history.push("/admin/index");
            })
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

    // enable multiple checkboxes to be checked
    onChangeRoleCheckBox = (position) => {
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

    fillCheckBoxes = () => {
        const elmList = document.getElementsByClassName('roleCheckBox')
        const updatedCheckedState = new Array(elmList.length).fill(false);
        this.state.roles.map(role => {
            for (let i = 0; i < elmList.length; i++) {
                if (elmList[i].value == role.name) {
                    updatedCheckedState[i] = true;
                }
            }
        });

        // only root role, check all boxes
        this.state.roles.map(role => role.name == "root" ? updatedCheckedState.fill(true) : null);

        this.setState({ checkedState: updatedCheckedState });
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

        let roles = document.getElementsByName("roles[]");
        let roles_submit = [];
        roles.forEach((item) => {
            if (item.checked) {
                roles_submit.push(item.value);
            }
        });

        if (roles_submit.length == 0) {
            this.setState({
                message: "Please add at least 1 role!",
                successful: false
            });
            return;
        }

        // max length, meaning all roles are chosen, put root only
        if (roles_submit.length == roles.length) {
            roles_submit = ["root"];
        }

        this.form.validateAll();

        if (this.checkBtn.context._errors.length === 0) {
            UserService.editUser(
                this.props.match.params.id,
                this.state.username,
                this.state.email,
                this.state.phone,
                [this.state.location, this.state.district],
                this.state.confirm_new_password,
                roles_submit
            ).then((response) => {
                if (response.status == 200 || response.status == 201) {
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

                // // redirect to index page after update
                // this.props.history.push('/admin/index');
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
        // redirect to home page when unauthorized user tries to view
        if (!AuthService.isRoot() && !AuthService.getRoles().includes("ROLE_EDIT_ADMIN")) {
            return <Redirect to='/admin/index' />
        }
        // prevent admins from editing their own profile, except root admin
        if (!(this.props.match.params.id != AuthService.getCurrentUser().id || AuthService.getCurrentUser().roles.includes("ROLE_ROOT"))) {
            return <Redirect to='/admin/view/admin' />
        }
        // prevent any admin from editing root admin's info
        if (this.state.username == "root" && AuthService.getCurrentUser().name != "root") {
            return <Redirect to='/admin/view/admin' />
        }
        return (
            <div>
                <Link to="/admin/view/admin" style={{ marginLeft: "15em" }}>
                    <button className="Redirect-btn">View admins</button>
                </Link>
                <div className="container" style={{ width: "30em" }}>
                    <Form onSubmit={this.handleRegister} ref={c => { this.form = c; }}>
                        <h1 className="Big-text">Edit admin</h1>
                        <br />
                        <Input
                            id="username"
                            name="username"
                            className="Input"
                            type="text"
                            placeholder="Username"
                            value={this.state.username}
                            // onChange={this.onChangeUsername}
                            // validations={[vusername]}
                            disabled
                        />

                        <Input
                            id="email"
                            name="email"
                            className="Input"
                            type="text"
                            placeholder="Email"
                            value={this.state.email}
                            onChange={this.onChangeEmail}
                            validations={[required, email]}
                        />

                        <Input
                            id="phone"
                            name="phone"
                            className="Input"
                            type="text"
                            value={this.state.phone}
                            onChange={this.onChangePhone}
                            validations={[required, vphone]}
                            placeholder="Phone number"
                        />

                        <Select
                            id="location"
                            name="location"
                            className="Input"
                            value={this.state.location}
                            onChange={this.onChangeLocation}
                        >
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
                        >
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
                            validations={[vpassword]}
                        />

                        <Input
                            id="confirm-new-password"
                            name="confirm-new-password"
                            className="Input"
                            type="password"
                            placeholder="Confirm New Password"
                            value={this.state.confirm_new_password}
                            onChange={this.onChangeConfirmNewPassword}
                            validations={[requiredNewPassword, vpassword]}
                        />

                        <table className="role-table">
                            <tbody>
                                <tr>
                                    <td colSpan="2" className="tableheader tablerow-root">Root Admin (Full Admin Access)</td>
                                    <td className="tablerow-root">
                                        <Input
                                            className="roleCheckBox"
                                            type="checkbox"
                                            onClick={() => this.updateCheckBox(0, 10)}
                                            checked={this.state.checkedState[0]}
                                        />
                                    </td>
                                </tr>
                                <tr className="tableheader">
                                    <td colSpan="2" className="tableheader">Manage Users</td>
                                    <td className="tableheader">
                                        <Input
                                            className="roleCheckBox"
                                            type="checkbox"
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
                                            className="roleCheckBox"
                                            type="checkbox"
                                            name="roles[]"
                                            value="view_user"
                                            checked={this.state.checkedState[2]}
                                            onChange={() => this.onChangeRoleCheckBox(2)}
                                        />
                                    </td>
                                </tr>
                                <tr className="tablerow">
                                    <td width="15%">&nbsp;</td>
                                    <td className="tablerow">Add New Users</td>
                                    <td className="tablerow">
                                        <Input
                                            className="roleCheckBox"
                                            type="checkbox"
                                            name="roles[]"
                                            value="create_user"
                                            checked={this.state.checkedState[3]}
                                            onChange={() => this.onChangeRoleCheckBox(3)}
                                        />
                                    </td>
                                </tr>
                                <tr className="tablerow">
                                    <td width="15%">&nbsp;</td>
                                    <td className="tablerow">Edit Users</td>
                                    <td className="tablerow">
                                        <Input
                                            className="roleCheckBox"
                                            type="checkbox"
                                            name="roles[]"
                                            value="edit_user"
                                            checked={this.state.checkedState[4]}
                                            onChange={() => this.onChangeRoleCheckBox(4)}
                                        />
                                    </td>
                                </tr>
                                <tr className="tablerow">
                                    <td width="15%">&nbsp;</td>
                                    <td className="tablerow">Delete Users</td>
                                    <td className="tablerow">
                                        <Input
                                            className="roleCheckBox"
                                            type="checkbox"
                                            name="roles[]"
                                            value="delete_user"
                                            checked={this.state.checkedState[5]}
                                            onChange={() => this.onChangeRoleCheckBox(5)}
                                        />
                                    </td>
                                </tr>
                                <tr><td style={{ visibility: 'hidden' }}>a</td></tr>
                                <tr>
                                    <td colSpan="2" className="tableheader">Manage Admins</td>
                                    <td className="tableheader">
                                        <Input
                                            className="roleCheckBox"
                                            type="checkbox"
                                            onClick={() => this.updateCheckBox(6, 10)}
                                            checked={this.state.checkedState[6]}
                                            value="" />
                                    </td>
                                </tr>
                                <tr className="tablerow">
                                    <td width="15%">&nbsp;</td>
                                    <td className="tablerow">View Admins</td>
                                    <td className="tablerow">
                                        <Input
                                            className="roleCheckBox"
                                            type="checkbox"
                                            name="roles[]"
                                            value="view_admin"
                                            checked={this.state.checkedState[7]}
                                            onChange={() => this.onChangeRoleCheckBox(7)}
                                        />
                                    </td>
                                </tr>
                                <tr className="tablerow">
                                    <td width="15%">&nbsp;</td>
                                    <td className="tablerow">Add New Admins</td>
                                    <td className="tablerow">
                                        <Input
                                            className="roleCheckBox"
                                            type="checkbox"
                                            name="roles[]"
                                            value="create_admin"
                                            checked={this.state.checkedState[8]}
                                            onChange={() => this.onChangeRoleCheckBox(8)}
                                        />
                                    </td>
                                </tr>
                                <tr className="tablerow">
                                    <td width="15%">&nbsp;</td>
                                    <td className="tablerow">Edit Admins</td>
                                    <td className="tablerow">
                                        <Input
                                            className="roleCheckBox"
                                            type="checkbox"
                                            name="roles[]"
                                            value="edit_admin"
                                            checked={this.state.checkedState[9]}
                                            onChange={() => this.onChangeRoleCheckBox(9)}
                                        />
                                    </td>
                                </tr>
                                <tr className="tablerow">
                                    <td width="15%">&nbsp;</td>
                                    <td className="tablerow">Delete Admins</td>
                                    <td className="tablerow">
                                        <Input
                                            className="roleCheckBox"
                                            type="checkbox"
                                            name="roles[]"
                                            value="delete_admin"
                                            checked={this.state.checkedState[10]}
                                            onChange={() => this.onChangeRoleCheckBox(10)}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <button className="Create-btn">Update admin</button>

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
                        (AuthService.isRoot() || (AuthService.getRoles().includes("ROLE_EDIT_ADMIN") && AuthService.getRoles().includes("ROLE_DELETE_ADMIN"))))
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
                                            Delete admin
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