export interface IResJson<T> {
  status: boolean;
  statusCode: number;
  message: string;
  data: T;
}
