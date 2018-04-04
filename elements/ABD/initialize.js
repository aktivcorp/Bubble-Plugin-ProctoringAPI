function(instance, context) {
  
  function getPromisedMedia(cb, constraints, noFallbackToAudioOnly) {
    if (!navigator.mediaDevices.getUserMedia) {
      return;
    }
    navigator.mediaDevices.getUserMedia(constraints)
      .then(cb)
      .catch(function (error) {
        if (error && error.name == 'DevicesNotFoundError' && constraints.video && !noFallbackToAudioOnly) {
          constraints.video = false;
          getPromisedMedia(cb, constraints, true);
        } else {
          console.log(error.name);
        }
      });
  }

  function getScreen(cb) {
    getScreenId(function(error, sourceId, screen_constraints) {
      if (!error) {
        getPromisedMedia(cb, screen_constraints, true);
      }
    });
  }

  function initiateMediaStream(cb, constraints, noFallbackToAudioOnly) {
    if (!constraints) {
      constraints = {
        video: true,
        audio: true
      }
    }
    if (!constraints.screen) {
      getPromisedMedia(cb, constraints, noFallbackToAudioOnly);
    } else {
      getScreen(cb);
    }
  }

  function establishPeerConnection(sendDescription, onRemoteStream) {
    var pc = new RTCPeerConnection({
      'iceServers': [
        {urls: 'stun:stun.l.google.com:19302'},
        {urls: 'stun:stun1.l.google.com:19302'},
        {urls: 'stun:stun2.l.google.com:19302'},
        {urls: 'stun:stun3.l.google.com:19302'},
        {urls: 'stun:stun4.l.google.com:19302'},
        {
          urls: 'turn:46.101.168.80:3478',
          credential: 'test',
          username: 'test'
        }
      ]
    });
    pc.iceCandidatesPool = [];
    pc.cachedRemoteDescription = null;

    pc.onicecandidate = function (evt) {
      if (!evt.candidate) {
        //sendDescription(pc.localDescription);
      }
    };

    pc.onaddstream = function (evt) {
      console.log('stream', evt.stream);
      if (onRemoteStream) onRemoteStream(evt.stream);
    };

    pc.onremovestream = function (evt) {
      console.log('remove', evt);
    };

    pc.onnegotiationneeded = function() {
      console.log('onnegotiationneeded','have remote:',pc.cachedRemoteDescription);
      if(pc.cachedRemoteDescription) {
        pc.setRemoteDescription(new RTCSessionDescription(pc.cachedRemoteDescription), function () {
          pc.cachedRemoteDescription = null;
        }, logError);
      } else {
        pc.createOffer(function (sdp) {
          sdp.sdp = enhanceSDP(sdp.sdp, {
            audioBitrate: instance.data.audioBitrate,
            videoBitrate: instance.data.videoBitrate,
            videoFrameRate: instance.data.videoFrameRate});
          pc.setLocalDescription(sdp, function () {
          }, logError);
        }, logError);
      }
    };

    pc.oniceconnectionstatechange = function() {
      console.log('ice connection:', pc.iceConnectionState);
    };

    pc.onicegatheringstatechange = function() {
      console.log('ice gathering:', pc.iceGatheringState);
    };

    pc.onsignalingstatechange = function() {
      console.log('sig state:', pc.signalingState);
      if (pc.signalingState == "have-remote-offer") {
        pc.createAnswer(function (answer) {
          answer.sdp = enhanceSDP(answer.sdp, {
            audioBitrate: instance.data.audioBitrate,
            videoBitrate: instance.data.videoBitrate,
            videoFrameRate: instance.data.videoFrameRate});
          pc.setLocalDescription(new RTCSessionDescription(answer), function () {
            sendDescription(pc.localDescription);
          }, logError);
        }, logError);
      } else if (pc.signalingState == "have-local-offer") {
        sendDescription(pc.localDescription);
      }
    };

    return pc;
  }

  function publishMyStream(pc, localStream) {
    if (localStream) {
      console.log('added local stream');
      return pc.addStream(localStream);
    } else {
      return null;
    }
  }

  function proceedCandidate(pc, candidate) {
    pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  function proceedRemoteSDP(pc, sdp) {
    pc.setRemoteDescription(new RTCSessionDescription(sdp), function () {}, logError);
  }

  /// private
  function logError(error) {
    console.log(error.name + ': ' + error.message);
  }

  function enhanceSDP(sdpStr, enhanceData) {
    var sdpLines = sdpStr.split(/\r\n/);
    var sdpSection = 'header';
    var hitMID = false;
    var sdpStrRet = '';

    for (var sdpIndex in sdpLines) {
      var sdpLine = sdpLines[sdpIndex];

      if (sdpLine.length <= 0)
        continue;

      sdpStrRet += sdpLine;

      if (sdpLine.indexOf("m=audio") === 0) {
        sdpSection = 'audio';
        hitMID = false;
      }
      else if (sdpLine.indexOf("m=video") === 0) {
        sdpSection = 'video';
        hitMID = false;
      }
      else if (sdpLine.indexOf("a=rtpmap") == 0) {
        sdpSection = 'bandwidth';
        hitMID = false;
      }

      if (sdpLine.indexOf("a=mid:") === 0 || sdpLine.indexOf("a=rtpmap") == 0) {
        if (!hitMID) {
          if ('audio'.localeCompare(sdpSection) == 0) {
            if (enhanceData.audioBitrate !== undefined) {
              sdpStrRet += '\r\nb=CT:' + (enhanceData.audioBitrate);
              sdpStrRet += '\r\nb=AS:' + (enhanceData.audioBitrate);
            }
            hitMID = true;
          }
          else if ('video'.localeCompare(sdpSection) == 0) {
            if (enhanceData.videoBitrate !== undefined) {
              sdpStrRet += '\r\nb=CT:' + (enhanceData.videoBitrate);
              sdpStrRet += '\r\nb=AS:' + (enhanceData.videoBitrate);
              if (enhanceData.videoFrameRate !== undefined) {
                sdpStrRet += '\r\na=framerate:' + enhanceData.videoFrameRate;
              }
            }
            hitMID = true;
          }
          else if ('bandwidth'.localeCompare(sdpSection) == 0) {
            var rtpmapID;
            rtpmapID = getrtpMapID(sdpLine);
            if (rtpmapID !== null) {
              var match = rtpmapID[2].toLowerCase();
              if (('vp9'.localeCompare(match) == 0 ) || ('vp8'.localeCompare(match) == 0 ) || ('h264'.localeCompare(match) == 0 ) ||
                ('red'.localeCompare(match) == 0 ) || ('ulpfec'.localeCompare(match) == 0 ) || ('rtx'.localeCompare(match) == 0 )) {
                if (enhanceData.videoBitrate !== undefined) {
                  sdpStrRet += '\r\na=fmtp:' + rtpmapID[1] + ' x-google-min-bitrate=' + (enhanceData.videoBitrate) + ';x-google-max-bitrate=' + (enhanceData.videoBitrate);
                }
              }

              if (('opus'.localeCompare(match) == 0 ) || ('isac'.localeCompare(match) == 0 ) || ('g722'.localeCompare(match) == 0 ) || ('pcmu'.localeCompare(match) == 0 ) ||
                ('pcma'.localeCompare(match) == 0 ) || ('cn'.localeCompare(match) == 0 )) {
                if (enhanceData.videoBitrate !== undefined) {
                  sdpStrRet += '\r\na=fmtp:' + rtpmapID[1] + ' x-google-min-bitrate=' + (enhanceData.audioBitrate) + ';x-google-max-bitrate=' + (enhanceData.audioBitrate);
                }
              }
            }
          }
        }
      }
      sdpStrRet += '\r\n';
    }
    return sdpStrRet;
  }

  function getrtpMapID(line) {
    var findid = new RegExp('a=rtpmap:(\\d+) (\\w+)/(\\d+)');
    var found = line.match(findid);
    return (found && found.length >= 3) ? found : null;
  }

  //-----------------------------------------------------------------------------------

  function connectWowza(url, app, streamName, proceedSdp, proceedCandidate, opened) {
    var connection = instance.data.wowzaConnection;

    connection.streamInfo = {applicationName: app, streamName: streamName, sessionId: "[empty]"};
    connection.playRetryCount = 0;

    connection.ws = new WebSocket(url);
    connection.ws.binaryType = 'arraybuffer';

    connection.ws.onopen = function () {
      console.log("wowzaConnector.ws.onopen");
      if(opened) opened();
    };

    connection.ws.onmessage = function (evt) {
      var msgJSON = JSON.parse(evt.data);
      var msgStatus = Number(msgJSON['status']);
      var msgCommand = msgJSON['command'];

      if (msgStatus == 200) {
        var streamInfoResponse = msgJSON['streamInfo'];
        if (streamInfoResponse !== undefined) {
          connection.streamInfo.sessionId = streamInfoResponse.sessionId;
        }

        var sdpData = msgJSON['sdp'];
        if (sdpData !== undefined) {
          if (proceedSdp) proceedSdp(sdpData);
        }

        var iceCandidates = msgJSON['iceCandidates'];
        if (iceCandidates !== undefined) {
          for (var index in iceCandidates) {
            if (proceedCandidate) proceedCandidate(iceCandidates[index]);
          }
        }
      } else if (msgStatus == 514 || msgStatus == 504 || msgStatus == 502) {
        connection.playRetryCount++;
        if (connection.playRetryCount < 10) {
          setTimeout(connection.play, connection.playRetryCount * 250);
        } else { 
          setTimeout(connection.play, 3000);
        }
      }

      if ('sendResponse'.localeCompare(msgCommand) == 0) {
        if (connection.ws != null)
          connection.ws.close();
        connection.ws = null;
      }
    };
  }

  function sendCandidate(candidate) {
  }

  function sendDescription(sdp) {
    var connection = instance.data.wowzaConnection;
    if (connection.ws.readyState == 0) {
      setTimeout(function () {
        sendDescription(sdp);
      }, 500);
    } else {
      if (sdp.type == 'offer') {
        connection.ws.send('{"direction":"publish", "command":"sendOffer", "streamInfo":' + JSON.stringify(connection.streamInfo) + ', "sdp":' + JSON.stringify(sdp) + '}');
      } else {
        connection.ws.send('{"direction":"play", "command":"sendResponse", "streamInfo":' + JSON.stringify(connection.streamInfo) + ', "sdp":' + JSON.stringify(sdp) + '}');
      }
    }
  }

  function play() {
    var connection = instance.data.wowzaConnection;
    if (!connection.ws || connection.ws.readyState == 0) {
      setTimeout(function () {
        play();
      }, 500);
    } else {
      connection.ws.send('{"direction":"play", "command":"getOffer", "streamInfo":' + JSON.stringify(connection.streamInfo) + '}');
    }
  }

  function stop() {
    if (instance.data.videoLeft && instance.data.videoLeft[0].srcObject) {
      var tracks = instance.data.videoLeft[0].srcObject.getTracks();
      for (var tr in tracks) if (tracks[tr]) tracks[tr].stop();
      instance.data.videoLeft[0].srcObject = null;
    } else if (instance.data.myStream) {
      var tracks = instance.data.myStream.getTracks();
      for (var tr in tracks) if (tracks[tr]) tracks[tr].stop();
    }
    instance.data.myStream = null;
  }

  function stopBoth() {
    instance.data.controller.stop();
  }

  function init(fromId, type) {
    instance.data.controller.stop();

    instance.data.controller.fromId = fromId;

    if (type != 'media_in' && type != 'screen_in') {
      if (type == 'screen_out') instance.data.constraints.screen = true;

      instance.data.webrtcCore.initiateMediaStream(function (stream) {
        if (instance.data.videoLeft) {
          instance.data.videoLeft[0].srcObject = stream;
          instance.data.videoLeft[0].muted = true;
        }
        instance.data.myStream = stream;

        var token = '' + instance.data.controller.fromId + '_' + Date.now() + (type == 'screen_out' ? '_s' : '');

        instance.data.wowzaConnection.connect('wss://'+context.keys.wowza_host+'/webrtc-session.json',
          (type == 'screen_out' ? 'sharing' : 'live'),
          token,
          function (sdp) {
            instance.data.webrtcCore.proceedRemoteSDP(instance.data.wowzaConnection.peer, sdp);
          }, function (candidate) {
            instance.data.webrtcCore.proceedCandidate(instance.data.wowzaConnection.peer, candidate)
          }, function () {
            instance.data.wowzaConnection.peer = instance.data.webrtcCore.establishPeerConnection(
              instance.data.wowzaConnection.sendDescription,
              function (remoteStream) {
                console.log('remoteStreamWowza WTF', remoteStream);
              }
            );
            instance.data.webrtcCore.publishMyStream(instance.data.wowzaConnection.peer, stream);
            instance.publishState("recordName", token);
            instance.triggerEvent("newRecord");
          }
        );
      }, instance.data.constraints);
    } else {
      var token = '' + instance.data.controller.fromId;

      instance.data.wowzaConnection.connect('wss://'+context.keys.wowza_host+'/webrtc-session.json',
        (type == 'screen_in' ? 'sharing' : 'live'),
        token,
        function (sdp) {
          instance.data.webrtcCore.proceedRemoteSDP(instance.data.wowzaConnection.peer, sdp);
        }, function (candidate) {
          instance.data.webrtcCore.proceedCandidate(instance.data.wowzaConnection.peer, candidate)
        }, function () {
          instance.data.wowzaConnection.peer = instance.data.webrtcCore.establishPeerConnection(
            instance.data.wowzaConnection.sendDescription,
            function (remoteStream) {
              if (instance.data.videoLeft) {
                instance.data.videoLeft[0].srcObject = remoteStream;
                instance.data.videoLeft[0].muted = false;
              }
            }
          );
          instance.data.wowzaConnection.play();
        }
      );
    }
  }

  instance.data.webrtcCore = {
    initiateMediaStream: initiateMediaStream,
    establishPeerConnection: establishPeerConnection,
    publishMyStream: publishMyStream,
    proceedRemoteSDP: proceedRemoteSDP,
    proceedCandidate: proceedCandidate
  };

  instance.data.wowzaConnection = {
    connection: null,
    peer: null,

    connect: connectWowza,
    sendCandidate: sendCandidate,
    sendDescription: sendDescription,
    play: play
  };

  instance.data.controller = {
    fromId: null,
    init: init,
    stop: stop,
    stopBoth: stopBoth
  };

  instance.data.constraints = {
    audio: true,
    video: {
      optional: [
        {
          minWidth: 320
        }
      ]
    }
  };
  instance.data.audioBitrate = 128;
  instance.data.videoBitrate = 300;
  instance.data.videoFrameRate = 29.97;
  instance.data.myStream = null;   
}