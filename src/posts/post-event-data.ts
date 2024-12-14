export class PostEventData {
  id: string;
  title?: string;
  content?: string;

  constructor(data: PostEventData) {
    Object.assign(this, data);
  }
}
