import './App.css';
import './css/Bootstrap.css'
import './css/Main.css'

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';  // npm install react-router-dom
import { Component } from 'react';

import AuthService from './services/auth.service';
import UserService from './services/user.service';
import AuthVerify from "./common/auth-verify";

import AdminProtectedRoute from './common/admin-protected-route';
import UserProtectedRoute from './common/user-protected-route';

import Home from "./Home"
import Login from "./Login"
import Signup from "./Signup"
import NotFound from "./NotFound"
import Cart from "./Cart"
import Transactions from "./Transactions"
import ItemDetails from './components/item.details';
import UserProfile from './components/profile';
import UserEditPassword from './components/profile.edit.password'
import UserIndex from './components/user.index';
import UserCreateItem from './components/user.create.item';
import UserEditItem from './components/user.edit.item';
import UserViewItem from './components/user.view.item';
import AdminIndex from './components/admin.index';
import AdminViewAdmin from './components/admin.view.admin';
import AdminViewUser from './components/admin.view.user';
import AdminCreateAdmin from './components/admin.create.admin';
import AdminCreateUser from './components/admin.create.user';
import AdminEditAdmin from './components/admin.edit.admin';
import AdminEditUser from './components/admin.edit.user';

export default class App extends Component {
    constructor(props) {
        super(props);
    }

    // check if user is in database or whether their data is altered
    // while they're still using the application and require re-login
    // to refresh the data in localStorage
    componentDidMount = async () => {
        if (localStorage.getItem("user") !== null) {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            let user = null;

            try {
                await UserService.viewOneUser(currentUser.id)
                    .then(response => {
                        user = response.data;
                    }, error => {
                        this.logout();
                    })
            } catch (err) {
                console.log(error);
            }

            if (!user) {
                this.logOut();
            } else {
                if (user.username !== currentUser.username) {
                    window.alert("Discrepency in user data detected, please log in again!");
                    this.logOut();
                    window.location.reload();
                    return;
                }
                if (user.email !== currentUser.email) {
                    window.alert("Discrepency in user data detected, please log in again!");
                    this.logOut();
                    window.location.reload();
                    return;
                }
                if (user.phone !== currentUser.phone) {
                    window.alert("Discrepency in user data detected, please log in again!");
                    this.logOut();
                    window.location.reload();
                    return;
                }
                if (user.location[0] !== currentUser.location[0] || user.location[1] !== currentUser.location[1]) {
                    window.alert("Discrepency in user data detected, please log in again!");
                    this.logOut();
                    window.location.reload();
                    return;
                }
            }
        }
    }

    logOut = () => {
        AuthService.logout();
    }

    render = () => {
        return (
            <Router>
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route exact path="/signup" component={Signup} />
                    <Route exact path="/login" component={Login} />
                    <Route path="/item/:id" component={ItemDetails} />
                    <UserProtectedRoute path="/cart" component={Cart} />
                    <UserProtectedRoute path="/transactions" component={Transactions} />
                    <UserProtectedRoute exact path='/user' component={UserProfile} />
                    <UserProtectedRoute exact path='/user/password' component={UserEditPassword} />
                    <UserProtectedRoute exact path='/user/index' component={UserIndex} />
                    <UserProtectedRoute exact path='/user/create' component={UserCreateItem} />
                    <UserProtectedRoute path='/user/edit/item/:id' component={UserEditItem} />
                    <UserProtectedRoute exact path='/user/items' component={UserViewItem} />
                    <AdminProtectedRoute exact path='/admin/index' component={AdminIndex} />
                    <AdminProtectedRoute exact path='/admin/view/admin' component={AdminViewAdmin} />
                    <AdminProtectedRoute exact path='/admin/view/user' component={AdminViewUser} />
                    <AdminProtectedRoute exact path='/admin/create/admin' component={AdminCreateAdmin} />
                    <AdminProtectedRoute exact path='/admin/create/user' component={AdminCreateUser} />
                    <AdminProtectedRoute path='/admin/edit/admin/:id' component={AdminEditAdmin} />
                    <AdminProtectedRoute path='/admin/edit/user/:id' component={AdminEditUser} />
                    <Route component={NotFound} />
                </Switch>
                <AuthVerify logOut={this.logOut} />
            </Router>
        );
    }
}

