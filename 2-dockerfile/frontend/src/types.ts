export type Note = {
  title: string;
  desc: string;
  priv: boolean;
  deleted: boolean;
};
export type NoteFull = (Note & { id: string; createdAt: string; updatedAt: string })
export type NotesFull = NoteFull[] 
