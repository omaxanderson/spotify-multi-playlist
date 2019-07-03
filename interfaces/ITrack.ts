export default interface ITrack {
   album: Object; // TODO create IAlbum
   artists: Object; // TODO create IArtists
   available_markets: Array<string>;
   disc_number: number;
   duration_ms: number;
   episode: boolean;
   explicit: boolean;
   external_ids: Object;
   external_urls: Object;
   href: string;
   id: string;
   is_local: boolean;
   name: string;
   popularity: number;
   preview_url: string;
   track: boolean;
   track_number: number;
   type: string;
   uri: string;
}
