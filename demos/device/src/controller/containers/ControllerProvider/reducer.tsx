export interface State {
  activeMeeting: boolean;
  isSharingLocalVideo: boolean;
}

export enum Type {
  MeetingJoined = 'MEETING_JOINED',
  MeetingData = 'MEETING_DATA',
  MeetingLeft = 'METTING_LEFT',
}

export interface Action {
  type: Type;
  payload: any;
}

export const initialState: State = {
  activeMeeting: false,
  isSharingLocalVideo: false,
};

export const reducer = (state: State, action: Action): State => {
  const { type, payload } = action;

  switch (type) {
    case Type.MeetingJoined:
      return {
        ...state,
        activeMeeting: true,
      };
    case Type.MeetingData:
      return {
        ...state,
        ...payload,
      };
    case Type.MeetingLeft:
      return {
        ...state,
        activeMeeting: false,
      };
    default:
      return { ...state };
  }
};