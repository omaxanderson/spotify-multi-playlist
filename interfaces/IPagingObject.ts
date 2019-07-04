export default interface IPagingObject {
   href: string;
   items: Array<any>; // TODO change to possible options
   limit: number;
   offset: number;
   next: string|null;
   previous: string|null;
   total: number;
}
