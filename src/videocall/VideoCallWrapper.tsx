import { useParams } from 'react-router-dom';
import VideoCallWeb from './VideoCallWeb';

export default function VideoCallWrapper() {
  const { friendId } = useParams();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = user.userId || 'defaultUserID';
  const roomId = [currentUserId, friendId].sort().join('_'); // Đảm bảo 2 chiều như nhau

  return <VideoCallWeb roomId={roomId} />;
}
