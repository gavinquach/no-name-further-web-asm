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
                <div id="about" >
                    <h4>ABOUT US</h4>
                    <b>A Food Trading Platform For Covid Lockdown Situation.</b><br></br>
                    Han Sang Yeob: s3821179<br></br>
                    Quach Gia Vi: s3757317<br></br>
                    Bui Manh Dai Duong: s3757278<br></br>
                    Nguyen Bao Tri: s3749560<br></br>
                    Vu Dang Phuc: s3801962<br></br>
                    Phan Gia Bao: s3741181<br></br>
                </div>
                <hr />
            </div>
        );
    }
}

