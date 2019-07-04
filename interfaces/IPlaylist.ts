import IPlaylistTracks from './IPlaylistTracks';
/**
 * Spotify Playlist object interface
 */
export default interface IPlaylist {
   collaborative: boolean;
   description: string;
   external_urls: Object;
   followers: Object;
   href: string;
   id: string;
   images: Array<Object>;
   name: string;
   owner: Object;
   primay_color: any;
   public: boolean;
   snapshot_id: string;
   tracks: IPlaylistTracks|Object;
   type: string;
   uri: string;
}
