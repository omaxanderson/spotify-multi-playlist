import IPlaylist from './IPlaylist';

export default interface IUserPlaylists {
   href: string;
   items: Array<IPlaylist>;
   limit: number;
   next: string|null;
   offset: number;
   previous: string|null;
   total: number;
}
