import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

const SERVER_URL = 'http://localhost:5000'; // Thay bằng IP thật nếu chạy trên device

export default function VideoCallWeb({ roomId }) {
  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);

  useEffect(() => {
    socketRef.current = io(SERVER_URL);
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      userVideo.current.srcObject = stream;

      socketRef.current.emit('join-room', roomId);

      socketRef.current.on('user-joined', userId => {
        const peer = createPeer(userId, socketRef.current.id, stream);
        peersRef.current.push({
          peerID: userId,
          peer,
        });
        setPeers(users => [...users, peer]);
      });

      socketRef.current.on('signal', ({ from, data }) => {
        const item = peersRef.current.find(p => p.peerID === from);
        if (item) {
          item.peer.signal(data);
        } else {
          const peer = addPeer(data, from, stream);
          peersRef.current.push({
            peerID: from,
            peer,
          });
          setPeers(users => [...users, peer]);
        }
      });
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId]);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', signal => {
      socketRef.current.emit('signal', {
        roomId,
        to: userToSignal,
        data: signal,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', signal => {
      socketRef.current.emit('signal', {
        roomId,
        to: callerID,
        data: signal,
      });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  return (
    <div>
      <video muted ref={userVideo} autoPlay playsInline style={{ width: 300 }} />
      {peers.map((peer, index) => (
        <Video key={index} peer={peer} />
      ))}
    </div>
  );
}

function Video({ peer }) {
  const ref = useRef();

  useEffect(() => {
    peer.on('stream', stream => {
      ref.current.srcObject = stream;
    });
  }, [peer]);

  return <video ref={ref} autoPlay playsInline style={{ width: 300 }} />;
}
