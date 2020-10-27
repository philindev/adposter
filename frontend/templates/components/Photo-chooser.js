import React from "react";
import '../styles/Modal.css';
import '../styles/Offer.css';
import { setHideBodyOverflow } from "./Utils";

class Cards extends React.Component{
    render() {
        let html_arr = [];
        let count = 1;
        const props = this.props;

        return (
            <div className='chooser-block'>
                {
                    props.data.map((obj, i, array) => {
                        if ((i + 1) % 4 === 0) {
                            count += 5;
                            let cur_arr = array.slice(i - 3, i + 1);
                            let row =
                                <div className="chooser-row" key={count}>
                                    <div
                                        key={count + 1}
                                        className="photo-block"
                                        style={{
                                            backgroundColor: '#eaeaea',
                                            backgroundImage: `url('/public/uploads/${cur_arr[0]}')`,
                                            backgroundSize: 'cover cover',
                                            backgroundPosition: 'center center',
                                        }}
                                        onClick={() => props.countCard(cur_arr[0])}>
                                        {
                                            props.chosen_img.includes(cur_arr[0]) ?
                                                <img src="/public/img/check.svg" alt="Выбран"/>
                                                :
                                                <img src="/public/img/circle-shape.svg" alt="Не выбран"/>
                                        }
                                    </div>
                                    <div
                                        key={count + 2}
                                        className="photo-block"
                                        style={{
                                            backgroundColor: '#eaeaea',
                                            backgroundImage: `url('/public/uploads/${cur_arr[1]}')`,
                                            backgroundSize: 'cover cover',
                                            backgroundPosition: 'center center',
                                        }}
                                        onClick={() => props.countCard(cur_arr[1])}>
                                        {
                                            props.chosen_img.includes(cur_arr[1]) ?
                                                <img src="/public/img/check.svg" alt="Выбран"/>
                                                :
                                                <img src="/public/img/circle-shape.svg" alt="Не выбран"/>
                                        }
                                    </div>
                                    <div
                                        key={count + 3}
                                        className="photo-block"
                                        style={{
                                            backgroundColor: '#eaeaea',
                                            backgroundImage: `url('/public/uploads/${cur_arr[2]}')`,
                                            backgroundSize: 'cover cover',
                                            backgroundPosition: 'center center',
                                        }}
                                        onClick={() => props.countCard(cur_arr[2])}>
                                        {
                                            props.chosen_img.includes(cur_arr[2]) ?
                                                <img src="/public/img/check.svg" alt="Выбран"/>
                                                :
                                                <img src="/public/img/circle-shape.svg" alt="Не выбран"/>
                                        }
                                    </div>
                                    <div
                                        key={count + 4}
                                        className="photo-block"
                                        style={{
                                            backgroundColor: '#eaeaea',
                                            backgroundImage: `url('/public/uploads/${cur_arr[3]}')`,
                                            backgroundSize: 'cover cover',
                                            backgroundPosition: 'center center',
                                        }}
                                        onClick={() => props.countCard(cur_arr[3])}>
                                        {
                                            props.chosen_img.includes(cur_arr[3]) ?
                                                <img src="/public/img/check.svg" alt="Выбран"/>
                                                :
                                                <img src="/public/img/circle-shape.svg" alt="Не выбран"/>
                                        }
                                    </div>
                                </div>;

                            html_arr.push(row);

                            if (i + 3 >= array.length) {
                                return (html_arr);
                            }

                        }
                    })
                }
            </div>
        )
    }
}


export default class PhotoChooser extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            chosen: [],
            photos: null,
        };

        this.fetchPhotos = this.fetchPhotos.bind(this);
        this.countCard = this.countCard.bind(this);
    }

    componentDidMount() {
        this.fetchPhotos();
        setHideBodyOverflow(true);
    }

    fetchPhotos(){
        const _this = this;
        fetch('/upload',
   {
            method: 'GET',
            headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
        },
        })
        .then(
        function(response) {
            // Define fetch errors
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' + response.status);
                return;
            }
            if(response.status === 500){
                console.log("Status: 500");
                return;
            }
            // Un-jsonify data
            response.json().then(
                function(data) {
                    // Doing something with response
                    if (data.length){
                        _this.setState({
                            photos: data,
                        });
                    } else {
                        _this.setState({
                            photos: [],
                        })
                    }
                });

        }).catch(function (error) {
                console.log('error: ', error);
        })
    }

    countCard(par){
        if (this.state.chosen.includes(par)){
            let arr = this.state.chosen;
            arr = arr.filter(obj => obj !== par);
            this.setState({
                chosen: arr,
            });
        } else if (this.state.chosen.length === 4) {
            this.setState({
                warning: true,
            })
        } else {
            let arr = this.state.chosen;
            arr.push(par);
            this.setState({
                chosen: arr,
            })
        }
    }

    render() {
        let modal =
            <div className="_modal" onClick={this.props.onHide}>
                <div className="_modal__dialog" onClick={e => e.stopPropagation()}>
                    <header>
                        {this.state.chosen.length} / 4
                    </header>
                    <main>
                        {
                            this.state.photos === null || this.state.photos === undefined ?
                                <div style={{
                                    display: 'flex',
                                    width: '100%',
                                    height: '100%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>Загрузка...</div>
                                :
                                <Cards data={this.state.photos} countCard={this.countCard} chosen_img={this.state.chosen}/>
                        }
                    </main>
                    <button type={'button'} onClick={() => {
                        this.props.setPhotos(this.state.chosen);
                        this.props.onHide();
                    }}>
                        Выбрать
                    </button>
                </div>
            </div>;

        return(modal)
    }
}