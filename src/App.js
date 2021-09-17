import './App.css';
import './css/Bootstrap.css'
import './css/Main.css'

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Component } from 'react';

import AuthService from './services/auth.service';
import UserService from './services/user.service';
import socket from './services/socket';
import AuthVerify from "./common/auth-verify";

import AdminProtectedRoute from './common/admin-protected-route';
import UserProtectedRoute from './common/user-protected-route';

import Home from './components/home';
import Signup from './components/signup';
import Login from './components/login';
import NotFound from './components/notfound';
import ItemDetails from './components/Item/item.details';
import Cart from './components/cart';
import TradeDetails from './components/Trade/trade.details';
import ItemCategory from "./components/ItemCategory/item.category"
import PopularOffers from "./components/popularoffers"
import Chat from './components/chat';
import Search from './components/search';

import NavigationBar from './components/Navbar/NavigationBar';
import Footer from './components/Footer/Footer'

import UserProfileIndex from './components/UserProfile/user.profile.index';
import Notifications from './components/UserProfile/user.notifications';
import UserTrades from './components/UserProfile/user.trades';
import UserPage from './components/User/user.page';
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
import AdminViewUserTrades from './components/Admin/admin.view.user.trades';
import AdminViewUserItems from './components/Admin/admin.view.user.items';

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: undefined
        };
    }

    logOutExpiredToken = () => {
        // show alert when user gets logged out automatically due to expired token
        window.alert("Login session expired, please log in again!");
        AuthService.logout();
        window.location.replace("/login");
        return;
    }

    updateNavBar = () => {
        if (!AuthService.isLoggedIn()) {
            this.setState({ currentUser: undefined });
            return;
        }
        const user = AuthService.getCurrentUser();
        user.isAdmin = AuthService.isAdmin(user);
        this.setState({ currentUser: user });
    }

    authenticateSocket = () => {
        if (!AuthService.isLoggedIn()) {
            return;
        }
        socket.emit("auth", AuthService.getCurrentUser());
    }

    componentDidMount = () => {
        this.authenticateSocket();
        this.updateNavBar();
    }

    render = () => {
        return (
            <div className="app">
                <Router>
                    <NavigationBar obj={this.state.currentUser} />
                    <Switch>
                        {/* public pages */}
                        <Route exact path="/" component={Home} />
                        <Route exact path="/signup" component={Signup} />
                        <Route exact path="/login/:email/:token" component={Login} />
                        <Route exact path="/login" component={Login} />
                        <Route path="/items" component={ItemCategory} />
                        <Route path="/item/:id" component={ItemDetails} />
                        <Route path="/popular" component={PopularOffers} />
                        <Route exact path='/trader/:username' component={UserPage} />
                        <Route exact path='/search' component={Search} />

                        {/* user pages */}
                        <UserProtectedRoute exact path="/cart" component={Cart} />
                        <UserProtectedRoute path="/trade/:id" component={TradeDetails} />
                        <UserProtectedRoute exact path='/user' component={UserIndex} />
                        <UserProtectedRoute exact path='/user/profile' component={UserProfileIndex} />
                        <UserProtectedRoute exact path="/user/notifications" component={Notifications} />
                        <UserProtectedRoute exact path="/user/trades" component={UserTrades} />
                        <UserProtectedRoute exact path='/user/create' component={UserCreateItem} />
                        <UserProtectedRoute path='/user/edit/item/:id' component={UserEditItem} />
                        <UserProtectedRoute exact path='/user/items' component={UserViewItem} />

                        {/* admin pages */}
                        <AdminProtectedRoute exact path='/admin/index' component={AdminIndex} />
                        <AdminProtectedRoute exact path='/admin/view/admin' component={AdminViewAdmin} />
                        <AdminProtectedRoute exact path='/admin/view/user' component={AdminViewUser} />
                        <AdminProtectedRoute exact path='/admin/create/admin' component={AdminCreateAdmin} />
                        <AdminProtectedRoute exact path='/admin/create/user' component={AdminCreateUser} />
                        <AdminProtectedRoute path='/admin/edit/admin/:username' component={AdminEditAdmin} />
                        <AdminProtectedRoute path='/admin/edit/user/:username' component={AdminEditUser} />
                        <AdminProtectedRoute exact path='/admin/view/user/trades' component={AdminViewUserTrades} />
                        <AdminProtectedRoute exact path='/admin/view/user/items' component={AdminViewUserItems} />
                        <Route component={NotFound} />
                    </Switch>
                    <Chat />
                    <Footer />
                    <AuthVerify logOut={this.logOutExpiredToken} />
                </Router>
            </div>
        );
    }
}

