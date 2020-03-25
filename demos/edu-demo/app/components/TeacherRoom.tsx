import classNames from 'classnames/bind';
import { ipcRenderer } from 'electron';
import React, { useContext, useState } from 'react';

import getChimeContext from '../context/getChimeContext';
import getMeetingStatusContext from '../context/getMeetingStatusContext';
import MeetingStatus from '../enums/MeetingStatus';
import ViewMode from '../enums/ViewMode';
import Chat from './Chat';
import Controls from './Controls';
import Error from './Error';
import LoadingSpinner from './LoadingSpinner';
import Roster from './Roster';
import ScreenPicker from './ScreenPicker';
import ScreenShareHeader from './ScreenShareHeader';
import StudentVideoGroup from './StudentVideoGroup';
import styles from './TeacherRoom.css';
import TeacherVideo from './TeacherVideo';

const cx = classNames.bind(styles);

export default function TeacherRoom() {
  const chime = useContext(getChimeContext());
  const { meetingStatus, errorMessage } = useContext(getMeetingStatusContext());
  const [viewMode, setViewMode] = useState(ViewMode.Room);
  const [isModeTransitioning, setIsModeTransitioning] = useState(false);
  const [isPickerEnabled, setIsPickerEnabled] = useState(false);

  const stopContentShare = async () => {
    setIsModeTransitioning(true);
    await new Promise(resolve => setTimeout(resolve, 200));
    ipcRenderer.on('chime-disable-screen-share-mode-ack', () => {
      try {
        chime.audioVideo.stopContentShare();
      } catch (error) {
        // eslint-disable-next-line
        console.error(error);
      } finally {
        setViewMode(ViewMode.Room);
        setIsModeTransitioning(false);
      }
    });
    ipcRenderer.send('chime-disable-screen-share-mode');
  };

  return (
    <div
      className={cx('teacherRoom', {
        roomMode: viewMode === ViewMode.Room,
        screenShareMode: viewMode === ViewMode.ScreenShare,
        isModeTransitioning
      })}
    >
      {meetingStatus === MeetingStatus.Loading && <LoadingSpinner />}
      {meetingStatus === MeetingStatus.Failed && (
        <Error errorMessage={errorMessage} />
      )}
      {meetingStatus === MeetingStatus.Succeeded && (
        <>
          <>
            <div className={cx('left')}>
              {viewMode === ViewMode.ScreenShare && (
                <ScreenShareHeader onClickStopButton={stopContentShare} />
              )}
              <div className={cx('remoteVideoGroup')}>
                <StudentVideoGroup viewMode={viewMode} />
              </div>
              <div className={cx('localVideoContainer')}>
                <div className={cx('controls')}>
                  <Controls
                    viewMode={viewMode}
                    onClickShareButton={() => {
                      setIsPickerEnabled(true);
                    }}
                  />
                </div>
                <div className={cx('localVideo')}>
                  <TeacherVideo />
                </div>
              </div>
            </div>
            <div className={cx('right')}>
              <div className={cx('roster')}>
                <Roster />
              </div>
              <div className={cx('chat')}>
                <Chat />
              </div>
            </div>
          </>
          {isPickerEnabled && (
            <ScreenPicker
              onClickShareButton={async (selectedSourceId: string) => {
                setIsModeTransitioning(true);
                await new Promise(resolve => setTimeout(resolve, 200));
                ipcRenderer.on(
                  'chime-enable-screen-share-mode-ack',
                  async () => {
                    try {
                      setIsPickerEnabled(false);
                      await chime.audioVideo.startContentShareFromScreenCapture(
                        selectedSourceId
                      );
                      setViewMode(ViewMode.ScreenShare);
                      setIsModeTransitioning(false);
                    } catch (error) {
                      // eslint-disable-next-line
                      console.error(error);
                      await stopContentShare();
                    }
                  }
                );
                ipcRenderer.send('chime-enable-screen-share-mode');
              }}
              onClickCancelButton={() => {
                setIsPickerEnabled(false);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
