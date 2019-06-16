import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import T from './components/Test2';

class App extends Component {

   render() {
      return <div><p>Hello</p><T /></div>;
   }
}

ReactDOM.render(<App />, document.getElementById('App'));
