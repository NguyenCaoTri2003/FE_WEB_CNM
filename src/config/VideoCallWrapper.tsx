import { useParams } from 'react-router-dom';
import VideoCallWeb from './VideoCallWeb';

export default function VideoCallWrapper() {
  const { friendId } = useParams();

  // Ở đây bạn có thể dùng friendId làm roomId hoặc tạo roomId từ bạn và friendId
  const roomId = `room_${friendId}`;

  return <VideoCallWeb roomId={roomId} />;
}
