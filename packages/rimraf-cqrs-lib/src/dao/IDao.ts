import { DomainEvent } from "../types";


export interface IDao {
  load(id: string, aggName: string): Promise<DomainEvent<any>[]>,
  insertEvent(event: DomainEvent<any>, aggName: string): Promise<void>

  close(): Promise<void>
}
