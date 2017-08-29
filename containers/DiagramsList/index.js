import React from 'react';
import { StyleSheet, View, Navigator, AsyncStorage } from 'react-native';
import { Container, Header, Content, List, ListItem, Text, Spinner } from 'native-base';
import { Actions } from 'react-native-router-flux';


export default class DiagramsList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataList: [],
        }
    }

    componentWillMount = () => {
        this.fetchDiagramsList();
    }

    fetchDiagramsList = () => {
        AsyncStorage.getItem('listOfXml').then((data) => {
            if (data !== null) {
                this.setState({
                    dataList: JSON.parse(data),
                });
            } else {
                fetch('https://xmltodiag.herokuapp.com/resources/Human%20Resources%20(HR)/?format=json')
                    .then((response) => response.json())
                    .then((responseJson) => {
                        AsyncStorage.setItem('listOfXml', JSON.stringify(responseJson));
                        this.setState({
                            dataList: responseJson,
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        })
    }

    render() {
        return (
            <Container>
                <Content>
                    {this.state.dataList.length ? <List>
                        {this.state.dataList.map((value, key) => {
                            return (
                                <ListItem key={key} onPress={() => Actions.diagramView({ fileName: value })}>
                                    <Text>{value}</Text>
                                </ListItem>);
                        })}
                    </List> : null}
                    {!this.state.dataList.length ? <View style={styles.container}>
                        <Spinner color='blue' />
                    </View> : null}
                </Content>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    spinner: {
        alignItems: 'center',
        justifyContent: 'center',
    }
});
