import React from 'react';
import { StyleSheet, Navigator, PanResponder, Dimensions, Animated, TouchableHighlight, Image, View } from 'react-native';
import { Container, Header, Button, Icon, Text, DeckSwiper, Card, CardItem, Thumbnail, Left, Body, Right, Spinner, Separator, Title } from 'native-base';
import { Actions } from 'react-native-router-flux';
import Swiper from "react-native-deck-swiper";
import * as Animatable from 'react-native-animatable';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

export default class DiagramView extends React.Component {
    constructor(props) {
        super(props);

        this.getJSON();

        this.state = {
            diagramElements: [],
            lines: [],
            slideNumber: 0,
            slidePath: [],
            isFetched: false,
            nextSlide: false,
            currentCard: 0,
        }
        // this.findDiagramElements('Activity')
    }

    getJSON = () => {
        fetch(`https://xmltodiag.herokuapp.com/file/resources/Human%20Resources%20(HR)/${this.props.navigation.state.params.fileName}/?format=json`)
            .then((response) => response.json())
            .then((responseJson) => {
                this.findDiagramElements(responseJson);
                this.setState({
                    nextSlide: responseJson.next.slice(0, -4),
                });
            })
            .catch((error) => {
                console.error(error);
            });
    }

    findDiagramElements = (json) => {
        const tempArray = [];
        json.DiagramElement.map((value, key) => {
            const elementName = Object.keys(value)[0];
            if (elementName === 'Activity') {
                tempArray.push(value.Activity);
            }
        });
        const sorted = this.sortDiagramElements(tempArray);
        this.setState({
            diagramElements: sorted,
            isFetched: true,
        });
    }

    sortDiagramElements = (elements) => elements.sort(this.sortById);

    sortById = (a, b) => Number(a['xmi.id'].match(/\d+/)[0]) - Number(b['xmi.id'].match(/\d+/)[0]);

    onSwipeLeft = () => {
        if (this.state.slideNumber !== 0) {
            this.setState({ slideNumber: this.state.slideNumber - 1 });
            this.refs.view.fadeInLeft().then((endState) => console.log(endState.finished ? 'bounce finished' : 'bounce cancelled'));
        }
    }

    onSwipeRight = () => {
        if (this.state.slideNumber !== this.state.diagramElements.length - 1) {
            this.setState({ slideNumber: this.state.slideNumber + 1 });
            this.refs.view.fadeInRight().then((endState) => console.log(endState.finished ? 'bounce finished' : 'bounce cancelled'));
        }
    }

    filterArrows = (array) => {
        console.log(array);
        return {
            inArrows: array.filter(value => value.type === 'in'),
            outArrows: array.filter(value => value.type === 'out'),
        }
    }

    generateTopArrows = (arrows) =>
        arrows.map((value, key) => (
            <Button key={key} bordered dark iconLeft full style={styles.arrowButton}>
                {this.state.slideNumber !== 0 && <Icon name='ios-arrow-round-back-outline' />}
                <Text style={styles.arrowText}>{value.data.name}</Text>
            </Button>))

    generateBottomArrows = (arrows) =>
        arrows.map((value, key) => (
            <Button key={key} bordered dark iconRight full style={styles.arrowButton}>
                <Text style={styles.arrowText}>{value.data.name}</Text>
                {this.state.slideNumber !== this.state.diagramElements.length - 1 && <Icon name='ios-arrow-round-forward-outline' />}
            </Button>))

    getResourceName = (info) => {
        if (Array.isArray(info)) {
            return info.map((value, key) => <View key={key} style={styles.bottomTextContainer}><Text style={styles.bottomText}>{value['CONTROL:ResName']}</Text></View>)
        } else {
            return info ? <View style={styles.bottomTextContainer}><Text style={styles.bottomText}>{info.ResName}</Text></View> : null;
        }
    }

    userSlide = (evt) => {
        const tempSlidePath = this.state.slidePath;
        tempSlidePath.push(evt.nativeEvent.locationX);
        this.setState({
            slidePath: tempSlidePath,
        });
    }

    slideFinished = () => {
        this.checkSlideSide();
        this.setState({
            slidePath: [],
        });
    }

    checkSlideSide = () => {
        const path = this.state.slidePath;
        if (path.length) {
            const slide = path[0] - path[path.length - 1];
            slide > 0 ? this.onSwipeRight() : this.onSwipeLeft();
        }
    }

    renderCard = card => {
        const arrows = this.filterArrows(card.lines);
        return (
            <View style={styles.containerCard}>
                {this.generateTopArrows(arrows.inArrows)}
                <View
                    style={styles.tileContainer}
                >
                    <View style={styles.mainTileTextContainer}><Text style={styles.mainTileText}>{card.name}</Text></View>
                    {this.getResourceName(card.RequiredResource)}
                </View>
                {this.generateBottomArrows(arrows.outArrows)}
            </View>
        );
    };

    generateDots = () => {
        return this.state.diagramElements.map((value, key) => {
            if (key === this.state.currentCard) {
                return <View style={styles.activeDot} key={key}></View>
            } else {
                return <View style={styles.dot} key={key}></View>
            }
        });
    }

    cardSwipedRight = (index) => {
        this.setState({
            currentCard: this.state.currentCard === 0 ? this.state.diagramElements.length-1 : this.state.currentCard - 1,
        });
    }

    cardSwipedLeft = (index) => {
        this.setState({
            currentCard: this.state.currentCard === this.state.diagramElements.length-1 ? 0: this.state.currentCard + 1,
        });
    }
// Actions.diagramView({ fileName: this.state.nextSlide })}

    goPrevious = () => {
        const nextSlide = this.props.navigation.state.params.fileName.slice(0, this.props.navigation.state.params.fileName.length-2);
        Actions.diagramView({ fileName: nextSlide });
    }

    render() {
        return (
            <Container>
                <Header style={{ backgroundColor: '#6B7A96' }}>
                    <Left>
                        <View style={styles.leftButton}>
                            <Button transparent onPress={() => Actions.diagramsList()}>
                                <Icon name='ios-list' />
                            </Button>
                            {this.props.navigation.state.params.fileName.length > 3 ? <Button style={styles.upButton} transparent onPress={this.goPrevious}>
                                <Icon name='ios-arrow-round-up' />
                            </Button> : null}
                        </View>
                    </Left>
                    <Body>
                        <View style={styles.title}>
                            <View><Text>                  </Text></View>
                            <Text style={styles.nextSlideFont}>{this.state.isFetched ? `Go To: ${this.state.nextSlide}` : ''}</Text>
                        </View>
                    </Body>
                    <Right>
                        <Button transparent onPress={() => Actions.diagramView({ fileName: this.state.nextSlide })}>
                            <Icon name='ios-arrow-round-forward-outline' />
                        </Button>
                    </Right>
                </Header>
                <View style={styles.swipeContainer}>
                    {(this.state.isFetched && this.state.diagramElements.length) ? <Text style={styles.currentLevel}>{`Current Level ${this.props.navigation.state.params.fileName}`}</Text> : null}
                    {(this.state.isFetched && this.state.diagramElements.length) ? <View style={styles.swipeContainer}>
                        <Swiper
                            swipeAnimationDuration={200}
                            showSecondCard={false}
                            backgroundColor="transparent"
                            marginBottom={60}
                            marginTop={-40}
                            infinite
                            ref={swiper => {
                                this.swiper = swiper;
                            }}
                            onSwipedLeft={this.cardSwipedLeft}
                            onSwipedRight={this.cardSwipedRight}
                            cards={this.state.diagramElements}
                            cardIndex={this.state.slideNumber}
                            renderCard={this.renderCard}
                            animateOverlayLabelsOpacity
                            animateCardOpacity
                            horizontalSwipe
                            verticalSwipe={false}
                            goBackToPreviousCardOnSwipeRight
                        >
                        </Swiper>
                    </View> : this.state.isFetched ? <Text style={styles.noCards}>No cards available</Text> : <Spinner color='blue' />}
                    {this.state.diagramElements.length ? <View style={styles.dotContainer}>{this.generateDots()}</View> : null}
                </View>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
    },
    title: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    upButton: {
        marginLeft: 10,
    },
    leftButton: {
        flexDirection: 'row',
    },
    swipeContainer: {
        flex: 1,
    },
    containerCard: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
    },
    arrowContainer: {
        flex: 1,
    },
    tileContainer: {
        flex: .8,
        justifyContent: 'flex-start',
        flexDirection: 'column',
        backgroundColor: '#EAEBF0',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#000',
        marginTop: 0,
        marginBottom: 5,
    },
    buttonsContainer: {
        flexDirection: 'row',
    },
    cardBar: {
        marginTop: 0,
        marginLeft: 5,
    },
    mainTileTextContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainTileText: {
        textAlign: 'center',
    },
    bottomTextContainer: {
        flex: 0.3,
        justifyContent: 'center',
        backgroundColor: '#6B7A96',
        borderBottomWidth: 1,
        borderBottomColor: '#fff'
    },
    bottomText: {
        justifyContent: 'center',
        textAlign: 'center',
        color: "#fff",
    },
    bottomArrow: {
        alignItems: 'flex-end',
    },
    topArrow: {
        justifyContent: 'flex-end',
        flex: 1,
    },
    arrowButton: {
        height: 'auto',
        backgroundColor: '#424242',
    },
    arrowText: {
        color: '#fff',
    },
    card: {
        flex: 1,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: "#E8E8E8",
        justifyContent: "center",
        backgroundColor: "white"
    },
    text: {
        textAlign: "center",
        fontSize: 50,
        backgroundColor: "transparent"
    },
    noCards: {
        marginTop: 50,
        justifyContent: 'center',
        textAlign: 'center',
    },
    nextSlideFont: {
        fontSize: 15,
        color: '#fff',
        textAlign: 'right',
        justifyContent: 'flex-end',
    },
    dotContainer: {
        marginBottom: 10,
        height: 10,
        marginLeft: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    dot: {
        width: 15,
        height:15,
        marginLeft: 5,
        marginRight: 5,
        backgroundColor: '#ccc',
        borderRadius: 50
    },
    activeDot: {
        width: 20,
        height:20,
        backgroundColor: '#000',
        borderRadius: 50
    },
    currentLevel: {
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        zIndex: 9999,
    },
    headerView: {
        flex: .5,
        flexDirection: 'row',
        justifyContent: 'center',
    }

});


