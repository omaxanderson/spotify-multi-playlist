import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class App extends Component {

   render() {
      return <div>Heres my app!</div>;
   }
}

const root = document.getElementById('App');
console.log('heyooooo');
ReactDOM.render(<App />, document.getElementById('App'));
