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


import Home from './components/home';
import Signup from './components/signup';
import Login from './components/login';
import ItemDetails from './components/Item/item.details';
import Cart from './components/cart';
import Trades from './components/Trade/trades';
import TradeDetails from './components/Trade/trade.details';
import NotFound from './components/notfound';
import UserProfile from './components/UserProfile/user.profile';
import UserEditPassword from './components/UserProfile/user.edit.password';
import UserIndex from './components/User/user.index';
import UserCreateItem from './components/User/user.create.item';
import UserEditItem from './components/User/user.edit.item';
import UserViewItem from './components/User/user.view.item';
import AdminIndex from './components/Admin/admin.index';
import AdminViewAdmin from './components/Admin/admin.view.admin';
import AdminViewUser from './components/Admin/admin.view.user';
import AdminCreateAdmin from './components/Admin/admin.create.admin';
import AdminCreateUser from './components/Admin/admin.create.user';
import AdminEditAdmin from './components/Admin/admin.edit.admin';
import AdminEditUser from './components/Admin/admin.edit.user';
import NavigationBar from './components/Navbar/NavigationBar';
import Footer from './components/Footer/Footer'
import ItemCategory from "./components/ItemCategory/item.category"
import PopularOffers from "./components/popularoffers"
import Notifications from "./components/Notifications/notifications"

import socket from './services/socket';

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: undefined
        };
    }

    // check if user is in database or whether their data is altered
    // while they're still using the application and require re-login
    // to refresh the data in localStorage
    checkDataChange = async () => {
        if (localStorage.getItem("user") !== null) {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            let user = null;

            try {
                await UserService.viewOneUser(currentUser.id)
                    .then(response => {
                        user = response.data;
                    }, error => {
                        console.log(error);
                        this.logout();
                    })
            } catch (err) {
                console.log(err);
            }

            if (!user) {
                this.logOut();
            } else {
                if (user.username !== currentUser.username) {
                    window.alert("Discrepancy in user data detected, please log in again!");
                    this.logOut();
                    window.location.reload();
                    return;
                }
                if (user.email !== currentUser.email) {
                    window.alert("Discrepancy in user data detected, please log in again!");
                    this.logOut();
                    window.location.reload();
                    return;
                }
                if (user.phone !== currentUser.phone) {
                    window.alert("Discrepancy in user data detected, please log in again!");
                    this.logOut();
                    window.location.reload();
                    return;
                }
                if (user.location[0] !== currentUser.location[0] || user.location[1] !== currentUser.location[1]) {
                    window.alert("Discrepancy in user data detected, please log in again!");
                    this.logOut();
                    window.location.reload();
                    return;
                }
            }
        }
    }

    updateNavBar = () => {
        if (localStorage.getItem("user") !== null) {
            const user = JSON.parse(localStorage.getItem('user'));
            user.isAdmin = AuthService.isAdmin(user);
            this.setState({ currentUser: user });
        } else {
            this.setState({ currentUser: undefined });
        }
    }

    authenticateSocket = () => {
        if (localStorage.getItem("user") !== null) {
            socket.emit("auth", AuthService.getCurrentUser());
        }
    }

    componentDidMount = () => {
        this.authenticateSocket();
        this.checkDataChange();
        this.updateNavBar();
    }

    logOut = () => {
        AuthService.logout();

        // show alert when user gets logged out automatically due to expired token
        window.alert("Login session expired, please log in again!");
        window.location.replace("/login");
        return;
    }

    render = () => {
        return (
        <div className = "app">
            <Router>
                <NavigationBar obj={this.state.currentUser}/>
                <Switch>
                    {/* public pages */}
                    <Route exact path="/" component={Home} />
                    <Route exact path="/signup" component={Signup} />
                    <Route exact path="/login/:email/:token" component={Login} />
                    <Route exact path="/login" component={Login} />
                    <Route path="/items" component={ItemCategory} />
                    <Route path="/item/:id" component={ItemDetails} />
                    <Route path="/popular" component={PopularOffers} />

                    {/* user pages */}
                    <UserProtectedRoute exact path="/cart" component={Cart} />
                    <UserProtectedRoute exact path="/notifications" component={Notifications} />
                    <UserProtectedRoute exact path="/trades" component={Trades} />
                    <UserProtectedRoute path="/trade/:id" component={TradeDetails} />
                    <UserProtectedRoute exact path='/user/profile' component={UserProfile} />
                    <UserProtectedRoute exact path='/user/password' component={UserEditPassword} />
                    <UserProtectedRoute exact path='/user' component={UserIndex} />
                    <UserProtectedRoute exact path='/user/create' component={UserCreateItem} />
                    <UserProtectedRoute path='/user/edit/item/:id' component={UserEditItem} />
                    <UserProtectedRoute exact path='/user/items' component={UserViewItem} />
                    
                    {/* admin pages */}
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
                <Footer />
            </Router>
            </div>
        );
    }
}

