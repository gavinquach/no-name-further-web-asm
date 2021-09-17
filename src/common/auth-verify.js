import { Component } from "react";
import { withRouter } from "react-router-dom";

const parseJwt = (token) => {
    try {
        return JSON.parse(Buffer.from((token.split('.')[1]), 'base64'));
    } catch (e) {
        return null;
    }
};

class AuthVerify extends Component {
    constructor(props) {
        super(props);

        props.history.listen(() => {
            const token = JSON.parse(localStorage.getItem("token"));
            if (token) {
                try {
                    const decodedJwt = parseJwt(token);
        
                    // log user out if JWT token expiration time
                    // is less than current date object
                    if (decodedJwt.exp * 1000 <= Date.now()) {
                        // convert expiration time of JWT token
                        // to milliseconds and compare to current time
                        // in milliseconds
                        props.logOut();
                    }
                } catch (err) {
                    // console.log(err);
                    window.alert("Something went wrong. Please log in again!");
                    localStorage.removeItem("token");
                    localStorage.removeItem("chatOpened");
                    localStorage.removeItem("conversationId");
                    window.location.replace("/login");
                    return;
                }
            }
        });
    }

    render() {
        return <div></div>;
    }
}

export default withRouter(AuthVerify);