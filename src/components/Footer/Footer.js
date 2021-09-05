import React, { Component } from 'react';
import '../../css/Footer.css'

export default class Footer extends Component {
    // Footer component
    render() {
        return (
            <div className="main-footer">
                {/* Column 1*/}
                <div id="description">
                    <h4 style={{ marginBottom: "0px", marginTop: "0px" }}>RMIT University SGS Campus</h4><br></br>
                    Further Web Programming Assignment<br></br>
                    <b>Address: </b>702 Nguyen Van Linh, Tan Hung, District 7<br></br> Ho Chi Minh City, Vietnam<br></br>
                </div>
                
                {/* Column 2*/}
                <div className="col">
                    <h4>ABOUT US</h4>
                </div>
                <hr />
            </div>
        );
    }
}

