import { useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useNavigate } from "react-router-dom";
import socket from "routes/socket";
import { Modal } from "antd";


export default function VideoCallWeb({ roomId }) {
  const appID = 1978537923;
  const serverSecret = "b9ff744a69bce9510ed341991daa2ec9";
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userID = user.userId || "defaultUserID";
  const userName = user.fullName || "defaultUserName";

  const containerRef = useRef(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.userId) {
      socket.emit("register", user.userId);
    }
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
          socket.emit("call-ended", { roomId });
          navigate("/user/home"); // ✅ quay lại home
           setTimeout(() => {
            navigate("/user/home");
            window.location.reload(); 
          }, 500); // chờ 500ms trước khi reload để đảm bảo emit xong
        },
      });
    };

    if (containerRef.current) {
      init();
    }

    
  }, [roomId]); 

  useEffect(() => {
    const handleCallEnded = ({ roomId }) => {
      console.log("📩 Đã nhận call-ended trong VideoCallWeb");
      Modal.destroyAll();
      Modal.info({
        title: "Cuộc gọi đã kết thúc",
        content: "Người kia đã rời khỏi cuộc gọi.",
        onOk: () => {
          navigate("/user/home");
          window.location.reload();
        },
      });
    };

    socket.on("call-ended", handleCallEnded);

    return () => {
      socket.off("call-ended", handleCallEnded);
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100vw", height: "100vh" }} />;
}
