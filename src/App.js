import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { get } from 'lodash';

class App extends Component {
   constructor(props) {
      super(props);

      this.state = {
         playlists: [],
         selected: {},
      }

      this.searchRef = React.createRef();
   }

   search = async (query) => {
      const encodedQuery = Object.keys(query).map(key => `${key}=${query[key]}`).join('&');
      console.log(get(this.searchRef, 'current.value', ''));
      const result = await fetch(`/search?q=${get(this.searchRef, 'current.value', '')}&type=artist`);
      const json = await result.json();
      console.log('res', result);
      console.log('json', json);
   }

   async componentDidMount() {
      try {
         const data = await fetch('/playlists?getAll=true', {
            mode: 'no-cors',
         });
         const playlists = await data.json();
         if ([200, 204].includes(data.status)) {
            this.setState({ playlists });
         } else {
            console.log('show error message');
            alert(playlists.message);
            window.location.reload();
         }
         console.log('data', data);
      } catch (e) {
         console.log('e', e);
      }
   }

   handleChange = (e) => {
      console.log(e);
      const { value } = e.target;
      const state = Object.assign({}, this.state.selected);
      state[value] = state[value] !== undefined ? !state[value] : true;
      this.setState({ selected: state });
   }

   onSubmit = async () => {
      console.log('submitting');
      const playlists = Object.keys(this.state.selected)
         .filter(k => this.state.selected[k])
         .map(k => this.state.playlists.find(p => p.name === k));
         // .find(k => this.state.playlists
      console.log(playlists);
      const result = await fetch('/play', {
         method: 'PUT',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(playlists),
      });
      console.log(result);
   }

   render() {
      console.log('render', this.state.playlists);
      return (
         <div>
            <p>Hello World</p>
            <button onClick={this.onSubmit}>Submit</button>
            <button onClick={this.search}>Search</button>
            <input type='text' id='search_q' ref={this.searchRef} />
            {
               this.state.playlists && this.state.playlists.map(p => (
                  <div>
                     <input
                        onChange={this.handleChange}
                        type='checkbox'
                        key={p.name}
                        name={p.name}
                        value={p.name}
                     />
                     <label htmlFor={p.name}>{p.name}</label>
                  </div>
               ))
            }
         </div>
      );
   }
}

ReactDOM.render(<App />, document.getElementById('App'));
