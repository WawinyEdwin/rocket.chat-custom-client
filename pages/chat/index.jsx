import React, { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { v4 as uuidv4 } from "uuid";

export default function RocketChat() {
  const socketUrl = process.env.RC_SERVER;
  const [history, setHistory] = useState(null);
  const [message, setChat] = useState("");
  const [showChat, setShowchat] = useState(false);
  const [address, setAddress] = useState("user-test");
  const [userToken, setUserToken] = useState("");
  const [typingMessage, setTypingMessage] = useState("");

  const roomId = "ZbAfyk5xKNjpHaB2fvBWqXHZX4pH4muoiM";
  const userId = "ZbAfyk5xKNjpHaB2f";

  const { sendMessage, readyState, getWebSocket } = useWebSocket(socketUrl, {
    onOpen: () => {
      // Make an Active Connection
      sendMessage(
        JSON.stringify({
          msg: "connect",
          version: "1",
          support: ["1", "pre2", "pre1"],
        })
      );

      // Login User
      sendMessage(
        JSON.stringify({
          msg: "method",
          method: "login",
          id: "42",
          params: [
            {
              user: { username: "test" },
              password: "123456",
            },
          ],
        })
      );

      // set user status
      sendMessage(
        JSON.stringify({
          msg: "method",
          method: "UserPresence:setDefaultStatus",
          id: uuidv4(),
          params: ["online"],
        })
      );

      // stream notify logged in
      sendMessage(
        JSON.stringify({
          msg: "sub",
          id: uuidv4(),
          name: "stream-notify-logged",
          params: ["user-status", false],
        })
      );

      // Notify User of Events
      if (userId) {
        sendMessage(
          JSON.stringify({
            msg: "sub",
            id: uuidv4(),
            name: "stream-notify-user",
            params: [`${userId}/message`, false],
          })
        );

        sendMessage(
          JSON.stringify({
            msg: "sub",
            id: uuidv4(),
            name: "stream-notify-user",
            params: [`${userId}/notification`, false],
          })
        );
      }

      if (roomId) {
        sendMessage(
          JSON.stringify({
            msg: "sub",
            id: uuidv4(),
            name: "stream-room-messages",
            params: [
              roomId,
              {
                useCollection: false,
                args: [],
              },
            ],
          })
        );

        // get events room events
        // 1. All user-activity
        sendMessage(
          JSON.stringify({
            msg: "sub",
            id: uuidv4(),
            name: "stream-notify-room",
            params: [`${roomId}/user-activity`, false],
          })
        );

        // 2. Typing
        sendMessage(
          JSON.stringify({
            msg: "sub",
            id: uuidv4(),
            name: "stream-notify-room",
            params: [`${roomId}/typing`, false],
          })
        );

        // 3. Delete Message
        sendMessage(
          JSON.stringify({
            msg: "sub",
            id: uuidv4(),
            name: "stream-notify-room",
            params: [`${roomId}/deleteMessage`, false],
          })
        );
      }
    },
  });

  if (readyState == 1) {
    getWebSocket().onmessage = (e) => {
      let resp = JSON.parse(e.data);

      if (resp.msg == "ping") {
        sendMessage(JSON.stringify({ msg: "pong" }));
      }

      if (resp.msg === "changed") {
        if (resp.collection == "stream-notify-logged") {
          console.log("User Online");
          return;
        }

        if (resp.collection == "stream-notify-user") {
          console.log(`Activity in room ${resp.fields.args[1]}`);
          return;
        }

        if (resp.collection == "stream-room-messages") {
          console.log(
            "Message received ",
            resp.fields.args[0].msg + " from " + resp.fields.args[0].u.name
          );
          return;
        }

        if (resp.collection == "stream-notify-room") {
          setTypingMessage(
            `${resp.fields.args[0]} is ${resp.fields.args[1]} ... `
          );
          return;
        }
      }

      if (resp.msg === "result" && resp.result) {
        if (resp.result.messages) {
          let allMsgs = resp.result.messages;
          console.log("-----previous msgs---------------");
          setHistory(allMsgs);
          console.log("---------------------------------");
          return;
        }

        if (resp.result.token) {
          console.log(`Login Response ${resp.result.token}`);
          setUserToken(resp.result.token);
          return;
        }
      }
    };
  }

  const handleChat = () => {
    // get Messages
    if (history) {
      setShowchat(true);
      return;
    } else {
      sendMessage(
        JSON.stringify({
          msg: "method",
          method: "loadHistory",
          id: uuidv4(),
          params: [roomId, null, 50, { $date: 1480377601 }],
        })
      );
    }
  };

  const sendChats = (e) => {
    e.preventDefault();
    if (readyState == 1 && message) {
      sendMessage(
        JSON.stringify({
          msg: "method",
          method: "sendMessage",
          id: "42",
          params: [
            {
              _id: uuidv4(),
              rid: roomId,
              msg: message,
            },
          ],
        })
      );
      setChat("");
      return;
    }
  };

  const handleChange = (e) => {
    console.log("typing");
    setChat(e.target.value);
    sendMessage(
      JSON.stringify({
        msg: "method",
        method: "stream-notify-room",
        id: uuidv4(),
        params: [`${roomId}/typing`, address, true],
      })
    );

    sendMessage(
      JSON.stringify({
        msg: "method",
        method: "stream-notify-room",
        id: uuidv4(),
        params: [`${roomId}/user-activity`, address, ["user-typing"], {}],
      })
    );
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="alert alert-primary" onClick={handleChat}>
          Click ME to chat with <b>{address}</b>
        </div>
      </div>
      <div className="content">
        {showChat && (
          <div className="row">
            <div className="col">
              <div className="">
                <p className="text-center">Conversation with user-test</p>
              </div>

              <ul>
                {history.map((chat) => (
                  <li key={chat._id}>{chat.msg}</li>
                ))}
              </ul>
            </div>
            <div className="col">
              <p className="text-center"> You are chatting with {address}</p>

              {typingMessage ? <small>{typingMessage}</small> : ""}
              <div className="">
                <form onSubmit={sendChats}>
                  <textarea
                    name="message"
                    className="form-control"
                    id=""
                    cols="30"
                    rows="5"
                    onChange={handleChange}
                  ></textarea>
                  <br />
                  <div className="text-center">
                    <button className="btn btn-primary" type="submit">
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
