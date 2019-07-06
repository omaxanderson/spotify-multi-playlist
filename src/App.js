import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { get, capitalize} from 'lodash';
import List from './components/List';
import Loader from './components/Loader';
import shortid from 'shortid';
import { Provider } from 'react-redux';
import M from 'materialize-css';
import store from './store';

class App extends Component {
   constructor(props) {
      super(props);

      this.state = {
         selected: [],
         currentTab: 'playlists',
         tabOpts: ['playlists', 'search'],
         toastMinimized: false,
      }

      this.searchRef = React.createRef();
   }

   async componentDidMount() {
      this.props.dispatch({
         type: 'FETCH_PLAYLISTS',
      });
      M.Collapsible.init(document.querySelectorAll('.collapsible'), {});
   }

   search = async (e) => {
      if (e) {
         e.preventDefault();
      }
      this.props.dispatch({
         type: 'SEARCH',
         payload: get(this.searchRef, 'current.value'),
      });
      this.setState({ currentTab: 'search' });
   }

   onSubmit = async (e) => {
      // ugh should honestly just move to sagas before it's too late
      // probably going to have to change this up
      e.preventDefault();

      this.props.dispatch({
         type: 'PLAY',
         payload: this.state.selected,
      });
   }

   removeSelected = (removeId) => {
      const selected = this.state.selected
         .slice()
         .filter(item => item.id !== removeId);
      this.setState({ selected });
   }

   toggleToastMinimized = () => {
      this.setState({ toastMinimized: !this.state.toastMinimized });
   }

   getToastThing = () => {
      if (this.state.toastMinimized) {
         console.log('minimized');
      } else {
         console.log('not minimized');
      }

      const selected = this.state.selected.slice();
      return (
         <div
            className='selectedToast'
            style={this.state.toastMinimized ? {paddingBottom: '5px'} : {}}
         >
            <div
               className='row'
               style={{marginBottom: '0px' }}
            >
               <h5 style={{ marginTop: '0px', marginBottom: '0px' }} className='left'>Selected</h5>
               <a
                  style={{transform: 'translateY(-5px)'}}
                  className='btn-flat right'
                  onClick={this.toggleToastMinimized}
               >
                  <i className='material-icons'>
                     {`arrow_drop_${this.state.toastMinimized ? 'up' : 'down'}`}
                  </i>
               </a>
            </div>
            {!this.state.toastMinimized && this.state.selected.map(item => (
               <div
                  key={shortid.generate()}
                  data-name={item.name}
                  data-id={item.id}
                  style={{marginBottom: '0px', marginTop: '6px'}}
                  className='row'
               >
                  <span style={{padding: '0px'}} className='col s11 m10 truncate'>{item.name}</span>
                  <span>
                     <i
                        className='col s1 m2 material-icons right trash'
                        onClick={() => this.removeSelected(item.id)}
                     >
                        delete
                     </i>
                  </span>
               </div>
            ))}
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

   renderPlaylists = () => {
      if (!this.props.playlists.length) {
         if (this.props.playlistsLoading) {
            return <Loader />;
         } else {
            return <div>You have no playlists to display!</div>;
         }
      }

      return (
         this.props.playlists.length
            ? <List
                  title='Playlists'
                  itemType='playlist'
                  onChange={this.testOnChange}
                  items={this.props.playlists}
                  checked={this.state.selected}
               />
            : (
               <Loader />
            )
      )
   }

   handleSearchClick = (e) => {
      const { value } = e.target;
      const state = Object.assign({}, this.state.searchResults);
   }

   renderSearchResults = () => {
      const {
         searchResults: results,
         searchLoading: loading,
         searchError: error,
      } = this.props;

      if (error) {
         return <div>{error}</div>;
      }

      if (!Object.keys(results).length) {
         if (loading) {
            return <Loader />
         } else {
            return <div>No results to display!</div>;
         }
      }

      // create list for each search result type
      const lists = Object.keys(results).map(key => {
         return {
            title: key,
            jsx: (
               <List
                  key={`${key}_list`}
                  title={key}
                  titleClass={'hide-on-small-and-down'}
                  items={results[key].items}
                  checked={this.state.selected}
                  onChange={this.testOnChange}
                  itemType={key}
               />
            ),
         };
      });

      setTimeout(() => {
         M.Collapsible.init(document.querySelectorAll('.collapsible'), {accordion: false});
      }, 50);

      return (
         <div>
            <div className='hide-on-med-and-up'>
               <ul className='collapsible expandable'>
                  {lists.map(list => {
                     return (
                        <li key={list.title} className='active'>
                           <h5 className='collapsible-header'>{list.title}</h5>
                           <div className='collapsible-body'>{list.jsx}</div>
                        </li>
                     );
                  })}
               </ul>
            </div>
            <div className='hide-on-small-and-down'>
               <div className='row'>
                  <div className='col l6'>
                     {lists.slice(0, 2).map(list => {
                        return list.jsx;
                     })}
                  </div>
                  <div className='col l6'>
                     {lists.slice(2, 4).map(list => {
                        return list.jsx;
                     })}
                  </div>
               </div>
            </div>
         </div>
      );
   }

   toggleView = () => {
      const currIdx = this.state.tabOpts.indexOf(this.state.currentTab);
      // lol super hacky, only works for two opts
      // be better
      this.setState({ currentTab: this.state.tabOpts[Number(!Boolean(currIdx))] });
   }

   clearSearch = () => {
      this.searchRef.current.value = '';
   }

   render() {
      return (
         <div className='container'>
            <h4 onClick={this.toggleView} >Spotify Multi-Playlist</h4>
            {
               Object.values(this.state.selected).find(a => a)
                  && this.getToastThing()
            }

            <form className='my-wrapper' onSubmit={this.search}>
               <div className='search-input input-field'>
                  <input placeholder='Search' type='search' id='search_q' ref={this.searchRef} />
                  <i style={{transform: 'translateY(5px)'}} className='material-icons' onClick={this.clearSearch}>close</i>
               </div>
               <div className='search-button'>
                  <button
                     style={{transform: 'translateY(15px)'}}
                     className='btn'
                     type='submit'
                     onClick={this.search}
                  >
                     Search
                  </button>
               </div>
            </form>

            <div className='row'>
               <form onSubmit={this.onSubmit}>
                  <button className='btn'>Submit<i className='material-icons right'>send</i></button>
               </form>
            </div>
            <div className='row'>
               {<div className='red-text'>{this.props.playError}</div>}
               {this.state.currentTab == 'playlists' && this.renderPlaylists() }
               {this.state.currentTab == 'search' && this.renderSearchResults() }
            </div>
         </div>
      );
   }
}

const Connected = connect(state => ({
   playlists: get(state, 'playlists.results', []),
   playlistsLoading: get(state, 'playlists.loading', false),
   searchResults: get(state, 'search.results', {}),
   searchLoading: get(state, 'search.loading', false),
   searchError: get(state, 'search.error', ''),
   playLoading: get(state, 'player.loading', ''),
   playError: get(state, 'player.error', ''),
}))(App);

ReactDOM.render((
   <Provider store={store}>
      <Connected />
   </Provider>
), document.getElementById('App'));
