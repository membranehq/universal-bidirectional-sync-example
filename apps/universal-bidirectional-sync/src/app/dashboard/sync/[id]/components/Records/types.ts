export interface TableRecord {
  id: string;
  data: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}
