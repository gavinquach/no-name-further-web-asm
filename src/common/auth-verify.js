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
            const user = JSON.parse(localStorage.getItem("user"));

            if (user) {
                const decodedJwt = parseJwt(user.accessToken);

                // log user out if JWT token expiration time
                // is less than current date object
                
                if (decodedJwt.exp * 1000 <= Date.now()) {
                    // convert expiration time of JWT token
                    // to milliseconds and compare to current time
                    // in milliseconds
                    props.logOut();
                }
            }
        });
    }

    render() {
        return <div></div>;
    }
}

export default withRouter(AuthVerify);