export interface INewResponseAPI<T> {
  message?: string;
  status?: boolean;
  result?: T;
  statusCode?: number;
}
