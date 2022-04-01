interface HasId {
  id: string;
}

interface Model<T extends HasId> {

}

interface Document {

}

type DocId = string

export interface AppDatabase {
  init(): Promise<AppDatabase>

  add(collectionName: string, doc: any): Promise<DocId>

  find(collectionName: string, query: any): Promise<Document[]>

  findById(collectionName: string, id: string): Promise<Document>

  update(collectionName: string, id: string, update: any): Promise<Document>

  delete(collectionName: string, id: string): Promise<DocId>

  close(): Promise<void>
}