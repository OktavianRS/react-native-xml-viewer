
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Container } from 'native-base';
import { Router, Scene, Actions } from 'react-native-router-flux';
import DiagramsList from './containers/DiagramsList';
import DiagramView from './containers/DiagramView';

export default class xmlApp extends Component {
  render() {
    return (
      <Container>
        <Router>
          <Scene key="root">
            <Scene key="diagramsList" component={DiagramsList} title="List of levels" />
            <Scene key="diagramView" component={DiagramView} title="" hideNavBar />
          </Scene>
        </Router>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('xmlApp', () => xmlApp);
