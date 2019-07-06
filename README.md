# Multi-playlist Player

The goal of this project is to be able to specify more than one album to play from at a time. The Spotify app doesn't allow you to play from more than one source without queueing things up, but this app will allow you to select multiple playlists to listen from at the same time.

#### Roadmap/Todo

   - ~~Split index.js into a few different files - I just hacked this together so it's currently ugly as hell.~~
   - ~~Make it look pretty~~
   - ~~Fix the /pug endpoint to a more reasonable name~~
   - ~~Add a searching feature~~
   - ~~Add the ability to select more than just playlists (albums, artists)~~
   - ~~Get the docker container working properly - currently it builds and runs fine but it doesn't seem to be exposing the correct port?~~
      * Ports are now correctly exposed and working, but the container doesn't have the right env variables
   - ~~Deploy it on Linode or AWS or something~~
   - ~~Fix some of the spotify API logic to account for pagination~~
   - Get Vault up and running
      * OR figure out how to set up a docker swarm and service that works just like docker-compose
   - change instances of "localhost" to something that dynamically gets the ip address
   - figure out how to run a docker swarm correctly
   - ~~TypeScript stuff~~
   - Add alternate shuffling methods
   - Fix the way you swap between your playlists and the search results
   - Add ~~loading and~~ success/failure notifications when you hit ~~search or~~ submit
   - ~~Clear out the search bar on click~~
   - Clear everything after successful submission
   - Clear the error message on new submit
   - ~~Figure out playlists.map bug~~
