import React, { Component } from 'react';
import {Link} from 'react-router-dom'
import '../../css/Footer.css'


export default class Footer extends Component {
    // Footer component
    render() {
        return (
            <div className = "main-footer">
                         {/* Column 1*/}
                         <div id ="description">
                            <h4 style={{"margin-bottom": "0px", "margin-top":"0px" }}>RMIT University SGS Campus</h4><br></br>
                            Further Web Programming Assignment<br></br>
                            <b>Address: </b>702 Nguyen Van Linh, Tan Hung, District 7<br></br> Ho Chi Minh City, Vietnam<br></br> 

                                    
                        </div>
                         {/* Column 2*/}
                         <div class = "col">
                            <h4>ABOUT US</h4>                    
                         </div>
                     <hr/>
                </div>
        );
    }
}

