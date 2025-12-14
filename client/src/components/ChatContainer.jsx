import React, {
  useEffect,
  useRef,
  useState,
  useContext
} from "react";

import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages
  } = useContext(ChatContext);

  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef(null);
  const [input, setInput] = useState("");

  // Send text message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    await sendMessage({ text: input.trim() });
    setInput("");
  };

  // Send image message
  const handleSendImage = async (e) => {
    const file = e.target.files[0];

    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  // Fetch messages when user changes
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // -------------------- UI --------------------
  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg">
      {/* ---------- HEADER ---------- */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt="profile"
          className="w-8 rounded-full"
        />

        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>

        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="back"
          className="md:hidden w-6 cursor-pointer"
        />

        <img
          src={assets.help_icon}
          alt="help"
          className="max-md:hidden w-5"
        />
      </div>

      {/* ---------- CHAT AREA ---------- */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-auto p-3 pb-6">
        {messages.map((msg, index) => {
          const isSender = msg.senderId === authUser._id;

          return (
            <div
              key={index}
              className={`flex mb-4 ${
                isSender ? "justify-end" : "justify-start"
              }`}
            >
              {isSender ? (
                <div className="flex items-end gap-2">
                  {/* Message */}
                  {msg.image ? (
                    <img
                      src={msg.image}
                      alt="sent"
                      className="max-w-[230px] border border-gray-700 rounded-lg"
                    />
                  ) : (
                    <p className="p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-words bg-violet-500/30 text-white rounded-br-none">
                      {msg.text}
                    </p>
                  )}

                  {/* Avatar + Time */}
                  <div className="flex flex-col items-center text-xs text-gray-500">
                    <img
                      src={
                        authUser?.profilePic || assets.avatar_icon
                      }
                      alt="me"
                      className="w-7 h-7 rounded-full"
                    />
                    <span>{formatMessageTime(msg.createdAt)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  {/* Avatar + Time */}
                  <div className="flex flex-col items-center text-xs text-gray-500">
                    <img
                      src={
                        selectedUser.profilePic ||
                        assets.avatar_icon
                      }
                      alt="user"
                      className="w-7 h-7 rounded-full"
                    />
                    <span>{formatMessageTime(msg.createdAt)}</span>
                  </div>

                  {/* Message */}
                  {msg.image ? (
                    <img
                      src={msg.image}
                      alt="received"
                      className="max-w-[230px] border border-gray-700 rounded-lg"
                    />
                  ) : (
                    <p className="p-2 max-w-[200px] md:text-sm font-light rounded-lg break-words bg-violet-500/30 text-white rounded-bl-none">
                      {msg.text}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <div ref={scrollEnd} />
      </div>

      {/* ---------- INPUT AREA ---------- */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            type="text"
            placeholder="Send a message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" ? handleSendMessage(e) : null
            }
            className="flex-1 text-sm p-3 border-none outline-none bg-transparent text-white placeholder-gray-400"
          />

          <input
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            hidden
            onChange={handleSendImage}
          />

          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt="gallery"
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>

        <img
          src={assets.send_button}
          alt="send"
          onClick={handleSendMessage}
          className="w-7 cursor-pointer"
        />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} className="w-16" alt="logo" />
      <p className="text-lg font-medium text-white">
        Chat anytime, anywhere
      </p>
    </div>
  );
};

export default ChatContainer;
