import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { get, capitalize} from 'lodash';
import List from './components/List';
import shortid from 'shortid';

class App extends Component {
   constructor(props) {
      super(props);

      this.state = {
         playlists: [],
         selected: [],
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
      // for convenience later
      Object.keys(json).forEach(key => json[key].type = key);
      // do something with that shit
      this.setState({searchResults: json, currentTab: 'search' });
   }

   handleChange = (e) => {
      const { value } = e.target;
      const state = Object.assign({}, this.state.selected);
      state[value] = state[value] !== undefined ? !state[value] : true;
      this.setState({ selected: state });
   }

   onSubmit = async (e) => {
      // ugh should honestly just move to sagas before it's too late
      // probably going to have to change this up
      e.preventDefault();
      console.log('submitting');

      const result = await fetch('/play', {
         method: 'PUT',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(this.state.selected),
      });
   }

   getToastThing = () => {
      const selected = this.state.selected.slice();
      return (
         <div className='selectedToast' >
            <h5 style={{ marginTop: '8px' }}>Selected</h5>
            {this.state.selected.map(item => <p key={shortid.generate()}>{item.name}</p>)}
         </div>
      );
   }

   testOnChange = (item) => {
      const selected = this.state.selected.slice();
      const alreadySelected = selected.find(i => i.id === item.id);
      if (alreadySelected) {
         this.setState({ selected: selected.filter(i => i.id !== item.id) });
      } else {
         this.setState({ selected: selected.concat(item) });
      }
   }

   /*
   shouldComponentUpdate(nextProps, nextState) {
      return this.state.playlists !== nextState.playlists
         || this.state.currentTab !== nextState.currentTab
         || this.state.searchResults !== nextState.searchResults
         || this.state.selected !== nextState.selected;
   }
   */

   renderPlaylists = () => {
      return (
         this.state.playlists.length
            ? <List
                  title='Playlists'
                  itemType='playlist'
                  onChange={this.testOnChange}
                  items={this.state.playlists}
                  checked={this.state.selected}
               />
            : (
               <div className='row'>
                  <div className='col s4 offset-s4 progress' style={{marginTop: '5vh'}}>
                     <div className='indeterminate'></div>
                  </div>
               </div>
            )
      )
   }

   handleSearchClick = (e) => {
      const { value } = e.target;
      const state = Object.assign({}, this.state.searchResults);
   }

   renderSearchResults = () => {
      const { searchResults } = this.state;
      // create list for each search result type
      const lists = Object.keys(searchResults).map(key => {
         return (
            <List
               key={`${key}_list`}
               title={key}
               items={searchResults[key].items}
               checked={this.state.selected}
               onChange={this.testOnChange}
               itemType={key}
            />
         );
      });
      return lists;
   }

   toggleView = () => {
      const currIdx = this.state.tabOpts.indexOf(this.state.currentTab);
      // lol super hacky, only works for two opts
      // be better
      this.setState({ currentTab: this.state.tabOpts[Number(!Boolean(currIdx))] });
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
                     <input placeholder='Search' type='text' id='search_q' ref={this.searchRef} />
                     <button className='btn' type='submit' onClick={this.search}>Search</button>
                  </form>
               </div>
               <div className='col s8'>

                  <form>
                     {
                        ['Artist', 'Playlist', 'Track', 'Album'].map(opt => (
                           <label
                              key={shortid.generate()}
                              style={{ display: 'inline', paddingRight: '30px', margin: 'auto', width: '100%'}}
                           >
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

            {this.state.currentTab == 'playlists' && this.renderPlaylists() }
            {this.state.currentTab == 'search' && this.renderSearchResults() }
            {/* this.state.currentTab == 'playlists' && this.renderPlaylists() */}
            {/* this.state.currentTab == 'search' && this.renderSearchResults() */}
         </div>
      );
   }
}

ReactDOM.render(<App />, document.getElementById('App'));
