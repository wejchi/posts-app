import { StateEnum } from '../enums/state.enum';

export class PostEventData {
  id: string;
  title?: string;
  content?: string;
  state?: StateEnum;

  constructor(data: PostEventData) {
    Object.assign(this, data);
  }
}
