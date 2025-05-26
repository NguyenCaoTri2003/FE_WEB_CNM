import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function CallRedirector() {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // ⚡ Redirect sau 100ms (ép reload cứng)
    const timeout = setTimeout(() => {
      navigate(`/call/${friendId}`, { replace: true });
    }, 100);

    return () => clearTimeout(timeout);
  }, [friendId]);

  return <div>🔄 Đang chuyển sang cuộc gọi...</div>;
}
