import IPlaylistTrack from './IPlaylistTrack';

export default interface IPlaylistTracks {
   href: string;
   items: Array<IPlaylistTrack>;
   limit: number;
   next: string|null;
   previous: string|null;
   total: number;
}
