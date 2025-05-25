import { useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useNavigate } from "react-router-dom";


export default function VideoCallWeb({ roomId }) {
  const appID = 1978537923;
  const serverSecret = "b9ff744a69bce9510ed341991daa2ec9";
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userID = user.userId || "defaultUserID";
  const userName = user.fullName || "defaultUserName";

  const containerRef = useRef(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const init = async () => {
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId,
        userID,
        userName
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
        showPreJoinView: false,
        onLeaveRoom: () => {
          console.log("👋 Đã rời khỏi phòng, chuyển về Home");
          navigate("/user/home"); // ✅ quay lại home
        },
      });
    };

    if (containerRef.current) {
      init();
    }
  }, [roomId]); // 👈 gọi lại khi roomId thay đổi

  return <div ref={containerRef} style={{ width: "100vw", height: "100vh" }} />;
}
