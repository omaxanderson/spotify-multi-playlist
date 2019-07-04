import React from 'react';
import ReactDOM from 'react-dom';

export default function Info() {
   return (
      <div className='container'>
         <h3>Info</h3>
         <p>
            Spotify doesn't give you the opportunity to play multiple playlists,
            artists, or albums at the same time without some tricky queue manipulation.
            Using this app, you can browse your own playlists or search for various things
            to listen to. Just click on on and it'll go into a list of things to play. Once
            you hit submit, everything you selected will play in a nice revolving manner that
            gives you the perfect mix for your mood.
         </p>
         <p>
            This project isn't complete yet and is still very much in development, so if you
            have any recommendations or issues, please reach out and let me know at
            omaxwellanderson@gmail.com.
         </p>
         <p>
            Thank you, and enjoy!
         </p>
         <h5> - Max</h5>
      </div>
   );
}

ReactDOM.render(<Info />, document.getElementById('Info'));
