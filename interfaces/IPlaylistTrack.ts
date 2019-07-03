import ITrack from './ITrack';

export default interface IPlaylistTrack {
   added_at: string;
   added_by: Object;
   is_local: boolean;
   primary_color: any;
   track: ITrack;
   video_thumbnail: Object;
}
