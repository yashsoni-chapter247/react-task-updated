import React, { Component } from "react";
import JsonData from '../../service/jsondata';
import InputRange from 'react-input-range';
import _ from 'underscore';
import 'react-input-range/lib/css/index.css'
import { Checkbox, Row, Col } from 'antd';
import 'jquery-ui/ui/effects/effect-slide';
import Helpers from "../../service/Helpers";
import { Button } from "react-bootstrap";
import { Modal } from "react-bootstrap";
import {
    Form,
    FormGroup,
    FormControl,
    ControlLabel,
    Image
} from "react-bootstrap";
import ReactImageZoom from 'react-image-zoom';
import './Home.css';

class Home extends Component {
    constructor(props) {
        super(props);
        let minPrice = _.min(JsonData.manData.data, _.property('price'));
        let maxPrice = _.max(JsonData.manData.data, _.property('price'));
        this.state = {
            activeTab: 'manData',
            size_filter: [],
            price_filter_value: {
                min: minPrice.price,
                max: maxPrice.price
            },
            max_product_price: maxPrice.price + 100,
            manData: JsonData.manData.data,
            womanData: JsonData.womanData.data,
            footwearData: JsonData.footwearData.data,
            bagsData: JsonData.bagsData.data,
            manDataFilter: JsonData.manData.filter,
            womanDataFilter: JsonData.womanData.filter,
            footwearDataFilter: JsonData.footwearData.filter,
            bagsDataFilter: JsonData.bagsData.filter,
            activeTabFilter: 'manDataFilter',
            show: false,
            selectedQuantity: 0,
            selectedData: []
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    static selectedTabData(key) {
        let dataObj;
        switch (key) {
            case 'manData':
                dataObj = JsonData.manData.data;
                break;
            case 'womanData':
                dataObj = JsonData.womanData.data;
                break;
            case 'bagsData':
                dataObj = JsonData.bagsData.data;
                break;
            case 'footwearData':
                dataObj = JsonData.footwearData.data;
                break;
            default:
                dataObj = JsonData.manData.data;
        }
        return dataObj
    }

    selectedTab(key) {
        this.setState({
            activeTab: key,
            activeTabFilter: key + 'Filter',
            size_filter: []
        });
        this.setPrice(Home.selectedTabData(key))
    }

    setPrice(dataObj) {
        let minPrice = _.min(dataObj, _.property('price'));
        let maxPrice = _.max(dataObj, _.property('price'));
        this.setState({
            price_filter_value: {
                min: minPrice.price,
                max: maxPrice.price
            },
            max_product_price: maxPrice.price + 100,
        });
    }

    handleShow = (index) => {
        this.setState({ show: true });
        console.log(index);
        this.setState({ selectedData: this.state[this.state.activeTab][index] })
    };

    handleClose = () => {
        this.setState({ show: false });
    };


    increaseQuantity = () => {
        this.setState({ selectedQuantity: this.state.selectedQuantity + 1 })
    }

    decreaseQuantity = () => {
        if (this.state.selectedQuantity !== 0)
            this.setState({ selectedQuantity: this.state.selectedQuantity - 1 })
    }

    priceFilter(value) {
        this.setState({
            price_filter_value: value,
            [this.state.activeTab]: _.filter(Home.selectedTabData(this.state.activeTab), (a) => {
                return _.size(this.state.size_filter) > 0 ? (_.size(_.filter(a.size, f => this.state.size_filter.includes(f))) > 0) && (a.price >= value.min && a.price <= value.max) : (a.price >= value.min && a.price <= value.max);
            })
        });
    }

    sizeFilter = (key) => {
        let price = this.state.price_filter_value;
        let size_filter = _.intersection(key, this.state[this.state.activeTabFilter].size);
        this.setState({
            size_filter: size_filter,
            [this.state.activeTab]: _.filter(Home.selectedTabData(this.state.activeTab), function (value) {
                return _.size(size_filter) > 0 ? (_.size(_.filter(value.size, f => size_filter.includes(f))) > 0) && (value.price >= price.min && value.price <= price.max) : (value.price >= price.min && value.price <= price.max);
            })
        });
    };

    handleSubmit(data, index) {
        const array = [];
        array.push(data);
        const cartData = Helpers.getLocalStorageData('cartData');
        const findManData = _.findWhere(cartData, { id: data.id });
        if (findManData) {
            for (let i = 0; i < cartData.length; i++) {
                if (data.id === cartData[i].id) {
                    cartData[i].qty += 1;
                    break;
                }
            }
            Helpers.setLocalStorageData('cartData', cartData);
        } else {
            if (cartData) {
                cartData.push(array[0]);
                Helpers.setLocalStorageData('cartData', cartData);
            } else {
                Helpers.setLocalStorageData('cartData', array);
            }
        }
        setTimeout(() => {
            this.props.totalCnt(Helpers.getLocalStorageData('cartData') ? Helpers.getLocalStorageData('cartData').length : 0);
        }, 2000);


        let imgtodrag = document.getElementsByClassName('product-men')[index];
        let viewcart = document.getElementsByClassName('w3view-cart')[0];
        let imgtodragImage = imgtodrag.querySelector('.pro-image-front');

        let disLeft = imgtodrag.getBoundingClientRect().left;
        let disTop = imgtodrag.getBoundingClientRect().top;
        let cartleft = viewcart.getBoundingClientRect().left;
        let carttop = viewcart.getBoundingClientRect().top;
        let image = imgtodragImage.cloneNode(true);

        image.style = 'z-index: 1111; width: 100px;opacity:0.8; position:fixed; top:' + disTop + 'px;left:' + disLeft + 'px;transition: left 2s, top 2s, width 2s, opacity 2s cubic-bezier(1, 1, 1, 1)';
        var rechange = document.body.appendChild(image);
        setTimeout(function () {
            image.style.left = cartleft + 'px';
            image.style.top = carttop + 'px';
            image.style.width = '40px';
            image.style.opacity = '0';
        }, 200);
        setTimeout(function () {
            rechange.parentNode.removeChild(rechange);
        }, 2000);
    }

    render() {
        console.log(this.state[this.state.activeTab])
        console.log(this.state.selectedData);
        var image = this.state.selectedData.image
        if (this.state.show === true) {
            var props = { width: 250, height: 310, zoomWidth: 380, img: image, offset: { vertical: 0, horizontal: 0 }, };
        }
        return (
            <div className="new_arrivals_agile_w3ls_info">
                <div className="container">
                    <h3 className="wthree_text_info">New <span>Arrivals</span></h3>
                    <div className='col-md-3'>
                        <div className='col-md-12'><b>Filter</b></div>
                        <div className='col-md-12' style={{ marginTop: 25 }}>
                            <InputRange minValue={0} maxValue={this.state.max_product_price}
                                value={this.state.price_filter_value}
                                onChange={(value) => this.setState({ 'price_filter_value': value })}
                                onChangeComplete={(value) => this.priceFilter(value)}
                            />
                        </div>
                        <div className='col-md-12' style={{ marginTop: 20 }}><hr></hr><b>Size</b></div>
                        <div className='col-md-12' style={{ marginTop: 10 }}>
                            <Checkbox.Group defaultValue={[]} style={{ width: '100%' }} onChange={this.sizeFilter}>
                                <Row>
                                    {this.state[this.state.activeTabFilter].size.map((value, key) => {
                                        return (
                                            //<Col span={8} key={key}><Checkbox value={value}>{value}</Checkbox></Col>
                                            <Col span={8} key={key}><Checkbox value={value} className="checkbox-custom" /><span>{value}</span></Col>
                                        )
                                    })}
                                </Row>
                            </Checkbox.Group>
                        </div>
                        <div className='col-md-12' style={{ marginTop: 0 }}><hr></hr><b>Price</b></div>
                        <div className='col-md-12' style={{ marginTop: 0 }}>
                            <Checkbox.Group defaultValue={[]} style={{ width: '100%' }} onChange={this.sizeFilter}>
                                <Row>
                                    <Col span={16}><label className="checkbox-custom1"><input type="checkbox" hidden /><span>Roadstar</span></label></Col>
                                    <Col span={16}><label className="checkbox-custom1"><input type="checkbox" hidden /><span>Puma</span></label></Col>
                                    <Col span={16}><label className="checkbox-custom1"><input type="checkbox" hidden /><span>Duke</span></label></Col>
                                    <Col span={16}><label className="checkbox-custom1"><input type="checkbox" hidden /><span>United Color</span></label></Col>
                                    <Col span={16}><label className="checkbox-custom1"><input type="checkbox" hidden /><span>HRX</span></label></Col>
                                    <Col span={16}><label className="checkbox-custom1"><input type="checkbox" hidden /><span>WARGON</span></label></Col>
                                </Row>
                            </Checkbox.Group>
                        </div>
                        <div className='col-md-12' style={{ marginTop: 0 }}><hr></hr><b>Price</b></div>
                        <div className='col-md-12' style={{ marginTop: 0 }}>
                            <Checkbox.Group defaultValue={[]} style={{ width: '100%' }} onChange={this.sizeFilter}>
                                <div className="row no-gutters">
                                    <div className="col-sm-3"><label className="checkbox-color"><input type="checkbox" hidden /><span className="color red" /></label></div>
                                    <div className="col-sm-3"><label className="checkbox-color"><input type="checkbox" hidden /><span className="color green" /></label></div>
                                    <div className="col-sm-3"><label className="checkbox-color"><input type="checkbox" hidden /><span className="color yellow" /></label></div>
                                    <div className="col-sm-3"><label className="checkbox-color"><input type="checkbox" hidden /><span className="color blue" /></label></div>
                                    <Col className="col-sm-3"><label className="checkbox-color"><input type="checkbox" hidden /><span className="color pink" /></label></Col>
                                    <Col className="col-sm-3"><label className="checkbox-color"><input type="checkbox" hidden /><span className="color orange" /></label></Col>
                                    <Col className="col-sm-6"><span className="show-more">+ More</span></Col>
                                </div>
                            </Checkbox.Group>
                        </div>
                    </div>
                    <ul className="resp-tabs-list">
                        <li className={this.state.activeTab === 'manData' ? 'active' : ''}
                            onClick={() => this.selectedTab('manData')}>Men's
                        </li>
                        <li className={this.state.activeTab === 'womanData' ? 'active' : ''}
                            onClick={() => this.selectedTab('womanData')}>Women's
                        </li>
                        <li className={this.state.activeTab === 'bagsData' ? 'active' : ''}
                            onClick={() => this.selectedTab('bagsData')}>Bags
                        </li>
                        <li className={this.state.activeTab === 'footwearData' ? 'active' : ''}
                            onClick={() => this.selectedTab('footwearData')}>Footwear
                        </li>
                    </ul>

                    <div className='col-lg-9'>
                        <div id="horizontalTab">

                            <div className="resp-tabs-container">
                                {this.state[this.state.activeTab].map((value, key) => {
                                    return (<div className="col-md-4 product-men" key={key}>
                                        <div className="men-pro-item simpleCart_shelfItem">
                                            <div className="men-thumb-item" onClick={() => this.handleShow(key)}>
                                                <img src={value.image} alt={value.title}
                                                    className="pro-image-front" />
                                                <img src={value.image} alt={value.title}
                                                    className="pro-image-back" />
                                                <span className="product-new-top">New</span>
                                            </div>
                                            <div className="item-info-product ">
                                                <h4><a href="">{value.title}</a></h4>
                                                <div className="info-product-price">
                                                    <span className="item_price">{value.price}</span>
                                                    <del>{value.discount_price}</del>
                                                </div>
                                                <div
                                                    className="snipcart-details top_brand_home_details item_add single-item hvr-outline-out button2">
                                                    <fieldset>
                                                        <input type="submit" name="submit"
                                                            defaultValue="Add to cart"
                                                            className=" button add-to-cart"
                                                            onClick={() => this.handleSubmit(value, key)} />
                                                    </fieldset>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    )
                                })}
                                <div className="clearfix" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <Modal show={this.state.show} onHide={this.handleClose} dialogClassName="custom-modal" bsSize="medium   ">
                            <Modal.Header closeButton>
                                <Modal.Title> Product Details </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {this.state.show === true ?
                                    <div className="row padding">
                                        <div className="col-md-6 product_img">
                                            <ReactImageZoom {...props} zoomStyle="z-index: 1111" zoomLensStyle="opacity: 0.4;background-color: gray" />
                                            {/* <img src={this.state.selectedData.image} ></img> */}
                                        </div>
                                        <div className="col-md-6 product_content">
                                            <h4><strong>Product Id:</strong> <span>{this.state.selectedData.id}</span></h4>
                                            <strong>{this.state.selectedData.title}</strong>

                                            <div className="padding">
                                                <h4><strong>
                                                    <span> Price: </span>
                                                    <span class="glyphicon glyphicon-usd"></span> 75.00
                                  </strong></h4>
                                            </div>

                                            <p> Select Quantity </p>
                                            <div className="row padding">
                                                <div class="col-md-6">
                                                    <div class="input-group">
                                                        <span class="input-group-btn">
                                                            <button type="button" class="btn btn-danger btn-number" data-type="minus" onClick={() => this.decreaseQuantity()} data-field="quant[2]">
                                                                <span class="glyphicon glyphicon-minus"></span>
                                                            </button>
                                                        </span>
                                                        <input type="text" name="quant[2]" class="form-control input-number" value={this.state.selectedQuantity} min="1" max="100"></input>
                                                        <span class="input-group-btn">
                                                            <button type="button" class="btn btn-success btn-number" data-type="plus" onClick={() => this.increaseQuantity()} data-field="quant[2]">
                                                                <span class="glyphicon glyphicon-plus"></span>
                                                            </button>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <span> Select Size </span>
                                            <div className="row padding" >
                                                <div className="col-md-6">
                                                    <select class="form-control" name="select">
                                                        <option value="" >Size</option>
                                                        <option value="black"> S </option>
                                                        <option value="white"> M </option>
                                                        <option value="gold"> L </option>
                                                        <option value="rose gold"> XL</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <span> Select Color </span>
                                            <div className="row paddingColor" >
                                                <div className="col-md-12 ">
                                                    <div className="col-md-1 ">
                                                        <label className="orange">
                                                            <input type="radio" name="color" value="orange"></input>
                                                            <div className="layer"></div>
                                                            <div className="button"><span></span></div>
                                                        </label>
                                                    </div>

                                                    <div className="col-md-1 ">
                                                        <label className="amber">
                                                            <input type="radio" name="color" value="orange"></input>
                                                            <div className="layer"></div>
                                                            <div className="button"><span></span></div>
                                                        </label>
                                                    </div>
                                                    <div className="col-md-1 ">
                                                        <label className="lime">
                                                            <input type="radio" name="color" value="orange"></input>
                                                            <div className="layer"></div>
                                                            <div className="button"><span></span></div>
                                                        </label>
                                                    </div>
                                                    <div className="col-md-1 ">
                                                        <label className="blue">
                                                            <input type="radio" name="color" value="orange"></input>
                                                            <div className="layer"></div>
                                                            <div className="button"><span></span></div>
                                                        </label>
                                                    </div>
                                                    <div className="col-md-1 ">
                                                        <label className="teal">
                                                            <input type="radio" name="color" value="orange"></input>
                                                            <div className="layer"></div>
                                                            <div className="button"><span></span></div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                    : <div></div>}
                            </Modal.Body>
                            <Modal.Footer>
                                {/* <Button onClick={this.handleClose}>Close</Button> */}
                                <Button class-
                                    type="submit"
                                    onClick={() => this.handleSubmit(this.state.selectedData, this.state.selectedData.id)}
                                    bsStyle="primary"
                                >
                                    <span className="glyphicon glyphicon-plus"> </span>
                                    Add to Cart
                            </Button>
                            </Modal.Footer>
                        </Modal>
                    </div>
                </div>
            </div>
        );
    }
}


export default Home;