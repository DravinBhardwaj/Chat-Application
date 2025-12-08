import React, { useEffect, useRef } from "react";
import assets, { messagesDummyData } from "../assets/assets";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = ({ selectedUser, setSelectedUser }) => {
  const scrollEnd = useRef();

  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return selectedUser ? (
    <div className="h-full overflow-scroll relative backdrop-blur-lg">

      {/* ------- HEADER ------- */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img
          src={selectedUser.profilePic || selectedUser.avatar_icon}
          alt=""
          className="w-8 rounded-full"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className="md:hidden max-w-7 cursor-pointer"
        />
        <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
      </div>

      {/* ------- CHAT AREA ------- */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messagesDummyData.map((msg, index) => {
          const isSender =
            msg.senderId === "680f50e4f10f3cd28382ecf9";

          return (
            <div
              key={index}
              className={`flex mb-4 ${
                isSender ? "justify-end" : "justify-start"
              }`}
            >
              {/* MESSAGE + AVATAR/TIME */}
              {isSender ? (
                <div className="flex items-end gap-2">
                  {/* Message */}
                  {msg.image ? (
                    <img
                      src={msg.image}
                      alt=""
                      className="max-w-[230px] border border-gray-700 rounded-lg"
                    />
                  ) : (
                    <p
                      className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg break-words bg-violet-500/30 text-white rounded-br-none`}
                    >
                      {msg.text}
                    </p>
                  )}

                  {/* Avatar + Time */}
                  <div className="flex flex-col items-center text-xs text-gray-500">
                    <img
                      src={assets.avatar_icon}
                      alt=""
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
                      src={selectedUser.profilePic}
                      alt=""
                      className="w-7 h-7 rounded-full"
                    />
                    <span>{formatMessageTime(msg.createdAt)}</span>
                  </div>

                  {/* Message */}
                  {msg.image ? (
                    <img
                      src={msg.image}
                      alt=""
                      className="max-w-[230px] border border-gray-700 rounded-lg"
                    />
                  ) : (
                    <p
                      className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg break-words bg-violet-500/30 text-white rounded-bl-none`}
                    >
                      {msg.text}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <div ref={scrollEnd}></div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} className="max-w-16" alt="" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
