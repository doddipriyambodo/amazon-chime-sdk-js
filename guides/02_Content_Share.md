### Content Share
This guide explains how to share audio and video content such as screen capture or media files. This guide assumes you
have been able to create a meeting and add attendees to the meeting (See our [Getting Started](https://aws.github.io/amazon-chime-sdk-js/modules/gettingstarted.html) guide).

All content share APIs can be found in the audio-video API interface `meetingSession.audioVideo`. See [here](https://aws.github.io/amazon-chime-sdk-js/interfaces/audiovideofacade.html) for a list of methods you can use.
#### Share content
Using the `audioVideo` object, you can start sharing content by calling `startContentShare` and provide your own media
 stream:
```javascript
await audioVideo.startContentShare(mediaStream);
```
For screen capture, you can call `startContentShareFromScreenCapture` which will get the media stream from
 `mediaDevices.getDisplayMedia`:
```javascript
await audioVideo.startContentShareFromScreenCapture();
```

The content share will appear in the meeting as another attendee.

#### View the shared content
To view the shared content, you would need to:
 - Implement `videoTileDidUpdate` from [AudioVideoObserver](https://aws.github.io/amazon-chime-sdk-js/interfaces/audiovideoobserver.html) to receive update when the video tile is created.
 - Add an instance of the observer using the [addObserver](https://aws.github.io/amazon-chime-sdk-js/interfaces/audiovideofacade.html#addobserver) method so you can receive events.
 - In `videoTileDidUpdate`, simply bind the new video tile to a video element in your app:
    ```javascript
    const videoElement = document.getElementById('<your-video-element-id>');
    audioVideo.bindVideoElement(tileState.tileId , videoElement);
    ``` 
   You can use the `isContent` property of `tileState` to check if the video tile is a shared content and add any
    special handling for viewing content share there. Alternatively, you can use [Modality](https://aws.github.io
    /amazon-chime-sdk-js/interfaces/modality.html):
    ```javascript
    const modality = new DefaultModality(tileState.boundAttendeeId);
    if (modality.hasModality(DefaultModality.MODALITY_CONTENT)) {
      //Special handling for content share
    }
    ``` 
   
#### Other content share APIs
Using the `audioVideo` object, you can also pause, unpause, or stop sharing content.
    
   - To pause content share:
    
      ```javascript
      audioVideo.pauseContentShare();
      ```
   - To unpase content share:
      ```javascript
      audioVideo.unpauseContentShare();
      ```
   - To stop content share:
      ```javascript
      audioVideo.stopContentShare();
      ```
     
#### Next Steps
- Implement [ContentShareObserver](https://aws.github.io/amazon-chime-sdk-js/interfaces/contentshareobserver.html). 
Add an instance of the observer using the [addContentShareObserver](https://aws.github.io/amazon-chime-sdk-js/interfaces/audiovideofacade.html#addcontentshareobserver) method so you can receive events.     



