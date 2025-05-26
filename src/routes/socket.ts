import io from 'socket.io-client';

const token = localStorage.getItem('token'); // Hoặc nơi bạn đang lưu JWT

// const socket = io('http://localhost:5000', {
//   transports: ['websocket'],
//   auth: {
//     token: token,
//   },
// });
const socket = io('https://zaloapp-production.up.railway.app', {
  transports: ['websocket'],
  auth: {
    token: token,
  },
});




export default socket;
