import React from 'react';

export default function Loader() {
   return (
      <div className='row'>
         <div className='col s4 offset-s4 progress' style={{marginTop: '5vh'}}>
            <div className='indeterminate'></div>
         </div>
      </div>
   );
}
