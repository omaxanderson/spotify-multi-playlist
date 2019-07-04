import React, { Component } from 'react';
import shortid from 'shortid';
import { get } from 'lodash';

// 

export default class List extends Component {
   handleChange = (e) => {
      const { value } = e.target;
      const item = this.props.items.find(i => i.name === value);
      this.props.onChange({ type: this.props.itemType, ...item});
   }

   render() {
      return (
         <div>
            {this.props.title && <h4 className={this.props.titleClass} >{this.props.title}</h4>}
            {this.props.items.map(item => {
               let additionalInfoPath = '';
               switch (this.props.title) {
                  case 'albums':
                  case 'tracks':
                     additionalInfoPath = 'artists[0].name';
                     break;
                  default:
                     additionalInfoPath = '';
               }
               const additionalInfo = get(item, additionalInfoPath, false);
               return (
                  <p key={shortid.generate()}>
                     <label>
                        <input
                           onChange={this.handleChange}
                           type='checkbox'
                           key={item.name}
                           name={item.name}
                           value={item.name}
                           checked={Boolean(this.props.checked.find(i => i.id === item.id))}
                        />
                        <span className='black-text'>
                           {item.name}
                        <span className='grey-text'>
                           {additionalInfo
                              ? <span className='hover-test'>{` - ${additionalInfo}`}</span>
                              : ''
                           }
                        </span>
                        </span>
                     </label>
                  </p>
               );
            })}
         </div>
      );
   }
}

List.defaultProps = {
   items: [],
   checked: [],
   title: '',
   itemType: 'default',
   titleClass: '',
}
