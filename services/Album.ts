import axios from 'axios';
import { get } from 'lodash';
import IAlbum from '../interfaces/IAlbum';
import ITrack from '../interfaces/ITrack';
import IPagingObject from '../interfaces/IPagingObject';

export default class Album {
   static getAlbumTracks = async (albumId: string, accessToken: string, limit: number = 20): Promise<Array<ITrack>>=> {
      try {
         const result = await axios.get(`https://api.spotify.com/v1/albums/${albumId}/tracks?access_token=${accessToken}`);
         const tracks: Array<ITrack> = get(result, 'data.items', []);
         return tracks;
      } catch (e) {
         return e;
      }
   }

   static getAlbum = async (albumId: string, accessToken: string): Promise<IAlbum>=> {
      try {
         const result = await axios.get(`https://api.spotify.com/v1/albums/${albumId}?access_token=${accessToken}`);
         const album: IAlbum = get(result, 'data', {});
         return album;
      } catch (e) {
         return e;
      }
   }
}
