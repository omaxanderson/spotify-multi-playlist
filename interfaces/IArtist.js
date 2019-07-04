export default interface IArtist {
   external_urls: Object;
   followers: Object;
   genres: Array<string>;
   href: string;
   id: string;
   images: Array<Object>;
   name: string;
   popularity: number;
   type: string;
   uri: string;
}
