import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { get } from 'lodash';

class App extends Component {
   constructor(props) {
      super(props);

      this.state = {
         playlists: [],
         selected: {},
         currentTab: 'playlists',
         tabOpts: ['playlists', 'search'],
         searchOpts: ['Playlist', 'Album', 'Track', 'Artist'],
         searchResults: {},
      }

      this.searchRef = React.createRef();
      this.state.searchOpts.forEach(opt => {
         this[`ref${opt}`] = React.createRef();
      });
   }

   search = async (query) => {
      const vals = this.state.searchOpts.map(opt => {
         const { value, checked } = this[`ref${opt}`].current;
         return { option: value.toLowerCase(), checked };
      });
      const checked = vals.filter(opt => opt.checked).map(opt => opt.option);;
      const specifyType = Boolean(vals.map(opt => opt.checked).find(t => t));

      const encodedQuery = Object.keys(query).map(key => `${key}=${query[key]}`).join('&');
      const result = await fetch(`/search?q=${get(this.searchRef, 'current.value', '')}`
         + `${ checked.length ? `&type=${ checked.join(',') }` : '' }`);
      const json = await result.json();
      // do something with that shit
      this.setState({searchResults: json, currentTab: 'search' });
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

   onSubmit = async (e) => {
      // ugh should honestly just move to sagas before it's too late
      e.preventDefault();
      console.log('submitting');
      const playlists = Object.keys(this.state.selected)
         .filter(k => this.state.selected[k])
         .map(k => this.state.playlists.find(p => p.name === k));

      const result = await fetch('/play', {
         method: 'PUT',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(playlists),
      });
   }

   getToastThing = () => {
      console.log('yay');
      return (
         <div className='selectedToast' >
            <h5 style={{ marginTop: '8px' }}>Selected</h5>
            {Object.keys(this.state.selected).filter(k => this.state.selected[k]).map(p => <p>{p}</p>)}
         </div>
      );
   }

   renderPlaylists = () => {
      return (
         this.state.playlists.length
            ? this.state.playlists.map(p => (
               <p>
                  <label>
                     <input
                        onChange={this.handleChange}
                        type='checkbox'
                        key={p.name}
                        name={p.name}
                        value={p.name}
                     />
                     <span>{p.name}</span>
                  </label>
               </p>
            ))
            : (<div className='row'>
               <div className='col s4 offset-s4 progress' style={{marginTop: '5vh'}}>
                  <div className='indeterminate'></div>
               </div>
            </div>)
      )
   }

   renderSearchResults = () => {
      const { searchResults } = this.state;
      console.log(searchResults);
      const { artists, tracks, albums, playlists } = searchResults;
      console.log('artists', artists);
      return (
         <div>
            {
               [artists, tracks, albums, playlists].map(list => {
                  if (!list) {
                     return;
                  }
                  console.log('list', list);
                  return (
                     list.items.map(res => {
                        return (
                           <div>
                              {res.name}
                           </div>
                        );
                     })
                  );
               })
            }
         </div>
      );
   }

   toggleView = () => {
      const currIdx = this.state.tabOpts.indexOf(this.state.currentTab);
      // lol super hacky, only works for two opts
      // be better
      this.setState({ currentTab: this.state.tabOpts[Number(!Boolean(currIdx))] });
   }

   test = () => {
   }

   render() {
      return (
         <div className='container'>
            <h3 onClick={this.toggleView} >Hello World</h3>
            {
               Object.values(this.state.selected).find(a => a)
                  && this.getToastThing()
            }
            <div className='row'>
               <div className='col s4'>
                  <form onSubmit={e => e.preventDefault()}>
                     <input type='text' id='search_q' ref={this.searchRef} />
                     <button className='btn' type='submit' onClick={this.search}>Search</button>
                  </form>
               </div>
               <div className='col s8'>

                     <button className='btn' onClick={this.test}>test</button>
                  <form>
                     {
                        ['Artist', 'Playlist', 'Track', 'Album'].map(opt => (
                           <label style={{ display: 'inline', paddingRight: '30px', margin: 'auto', width: '100%'}}>
                              <input ref={this[`ref${opt}`]} name={opt} value={opt} type='checkbox' />
                              <span>{opt}</span>
                           </label>
                        ))
                     }
                  </form>
               </div>
            </div>
            <form onSubmit={this.onSubmit}>
               <button className='btn'>Submit</button>
            </form>
            {this.state.currentTab == 'playlists' && this.renderPlaylists()}
            {this.state.currentTab == 'search' && this.renderSearchResults()}
         </div>
      );
   }
}

ReactDOM.render(<App />, document.getElementById('App'));
