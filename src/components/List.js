import React, { Component } from 'react';
import shortid from 'shortid';

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
            {this.props.title && <h5>{this.props.title}</h5>}
            {this.props.items.map(item => (
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
                     <span>{item.name}</span>
                  </label>
               </p>
            ))}
         </div>
      );
   }
}

List.defaultProps = {
   items: [],
   title: '',
   itemType: 'default',
}
