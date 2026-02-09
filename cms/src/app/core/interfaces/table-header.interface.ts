export interface SortMeta {
  sortParam: string;
  sortDirection: string;
  activeSort: boolean;
}

export interface TableHeader {
  field: string;
  header: string;
  sort?: SortMeta;
  date?: boolean;
}
