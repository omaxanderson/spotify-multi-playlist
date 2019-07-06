import axios from 'axios';
import { get } from 'lodash';
import IPlaylist from '../interfaces/IPlaylist';
import IUser from '../interfaces/IUser';

export default class User {
   /**
    * Gets a list of the specified user's playlist
    * @param userId string - the spotify user_id of the user to get playlists for
    * @param accessToken string - spotify access token that should be stored in the session data
    * @param limit number - number of playlists to return. If -1, get all playlists
    * @param offset number - offset from beginning of list
    *
    * @return Array<IPlaylist>
   */
   static getUserPlaylists = async (
      userId: string,
      accessToken: string,
      limit: number = 20,
      offset: number = 0): Promise<Array<IPlaylist>> => {

      // if limit is -1, that means get all playlists
      // else if limit > 50, we're going to have to make multiple requests
      const playlists: Array<IPlaylist> = [];
      let next = `https://api.spotify.com/v1/users/${userId}/playlists?offset=${offset}&limit=${limit > 50 || limit < 0 ? 50 : limit}` 
      do {
         try {
            const result = await axios.get(`${next}&access_token=${accessToken}`);
            next = get(result, 'data.next', false);
            playlists.push(...get(result, 'data.items', []));
         } catch (e) {
            const { response, request, message } = e;
            if (response) {
               console.log(response.data);
            } else if (request) {
               console.log(request);
            } else if (message) {
               console.log(message);
            }

            return [];
         }
      } while (next && (limit >= 0 ? playlists.length < limit : true))

      // this isn't pretty because we're really just discarding the leftovers from the last request,
      // but eh it's fine for now
      return playlists.slice(0, limit >= 0 ? limit : undefined);
   }

   static getUserInfo = async (userId: string, accessToken: string): Promise<IUser> => {
      try {
         const result = await axios.get(`https://api.spotify.com/v1/users/${userId}?access_token=${accessToken}`);
         const info: IUser = get(result, 'data', {});
         return info;
      } catch (e) {
         return e;
      }
   }
}
