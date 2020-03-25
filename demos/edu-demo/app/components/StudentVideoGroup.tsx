import { VideoTileState } from 'amazon-chime-sdk-js';
import classNames from 'classnames/bind';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import getChimeContext from '../context/getChimeContext';
import getRosterContext from '../context/getRosterContext';
import ViewMode from '../enums/ViewMode';
import useRaisedHandeAttendees from '../hooks/useRaisedHandeAttendees';
import RosterAttendeeType from '../types/RosterAttendeeType';
import StudentVideo, { Size } from './StudentVideo';
import styles from './StudentVideoGroup.css';

const cx = classNames.bind(styles);
const MAX_STUDENT_VIDEOS = 16;

type Props = {
  viewMode: ViewMode;
};

export default function StudentVideoGroup(props: Props) {
  const { viewMode } = props;
  const chime = useContext(getChimeContext());
  const roster = useContext(getRosterContext());
  const [visibleIndices, setVisibleIndices] = useState({});
  const raisedHandAttendees = useRaisedHandeAttendees();
  const videoElements: HTMLVideoElement[] = [];
  const tiles: { [index: number]: number } = {};

  const acquireVideoIndex = (tileId: number): number => {
    for (let index = 0; index < MAX_STUDENT_VIDEOS; index += 1) {
      if (tiles[index] === tileId) {
        return index;
      }
    }
    for (let index = 0; index < MAX_STUDENT_VIDEOS; index += 1) {
      if (!(index in tiles)) {
        tiles[index] = tileId;
        return index;
      }
    }
    throw new Error('no tiles are available');
  };

  const releaseVideoIndex = (tileId: number): number => {
    for (let index = 0; index < MAX_STUDENT_VIDEOS; index += 1) {
      if (tiles[index] === tileId) {
        delete tiles[index];
        return index;
      }
    }
    return -1;
  };

  const numberOfVisibleIndices = Object.keys(visibleIndices).reduce(
    (result, key) => result + (visibleIndices[key] ? 1 : 0),
    0
  );

  useEffect(() => {
    chime.audioVideo.addObserver({
      videoTileDidUpdate: (tileState: VideoTileState): void => {
        if (
          !tileState.boundAttendeeId ||
          tileState.localTile ||
          tileState.isContent
        ) {
          return;
        }
        const index = acquireVideoIndex(tileState.tileId);
        chime.audioVideo.bindVideoElement(
          tileState.tileId,
          videoElements[index]
        );
        setVisibleIndices(previousVisibleIndices => ({
          ...previousVisibleIndices,
          [index]: {
            boundAttendeeId: tileState.boundAttendeeId
          }
        }));
      },
      videoTileWasRemoved: (tileId: number): void => {
        const index = releaseVideoIndex(tileId);
        setVisibleIndices(previousVisibleIndices => ({
          ...previousVisibleIndices,
          [index]: null
        }));
      }
    });
  }, []);

  const getSize = (): Size => {
    if (numberOfVisibleIndices >= 10) {
      return Size.Small;
    }
    if (numberOfVisibleIndices >= 5) {
      return Size.Medium;
    }
    return Size.Large;
  };

  return (
    <div
      className={cx(
        'studentVideoGroup',
        `studentVideoGroup-${numberOfVisibleIndices}`,
        {
          roomMode: viewMode === ViewMode.Room,
          screenShareMode: viewMode === ViewMode.ScreenShare
        }
      )}
    >
      {numberOfVisibleIndices === 0 && (
        <div className={cx('instruction')}>No video</div>
      )}
      {Array.from(Array(MAX_STUDENT_VIDEOS).keys()).map((key, index) => {
        const visibleIndex = visibleIndices[index];
        let rosterAttendee: RosterAttendeeType = {};
        let raisedHand = false;
        if (visibleIndex && roster) {
          rosterAttendee = roster[visibleIndex.boundAttendeeId];
          if (raisedHandAttendees) {
            raisedHand = raisedHandAttendees.has(visibleIndex.boundAttendeeId);
          }
        }
        return (
          <StudentVideo
            key={key}
            viewMode={viewMode}
            enabled={!!visibleIndex}
            videoElementRef={useCallback((element: HTMLVideoElement) => {
              videoElements[index] = element;
            }, [])}
            size={getSize()}
            rosterAttendee={rosterAttendee}
            raisedHand={raisedHand}
          />
        );
      })}
    </div>
  );
}
