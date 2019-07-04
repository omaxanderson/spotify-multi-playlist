export default interface IAlbum {
   album_type: string;
   artists: Array<Object>; // TODO create IArtist
   available_markets: Array<string>;
   copyrights: Array<Object>;
   external_urls: Object;
   genres: Array<any>;
   href: string;
   id: string;
   images: Array<Object>;
   labal: string;
   name: string;
   popularity: number;
   release_date: string;
   release_date_precision: string;
   total_tracks: number;
   tracks: Object; // TODO create IAlbumTracks or check compatibility with IPlaylistTracks
   // alternately create a generic Paging Object
   type: string;
   uri: string;
}
