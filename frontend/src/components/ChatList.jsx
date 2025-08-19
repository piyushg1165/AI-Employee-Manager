import React from "react";
import { MdOutlineDelete } from "react-icons/md";

const ChatList = ({ chats, onChatSelect, onDeleteChat, currentChatId }) => {
	return (
		<div className="space-y-1">
			{Array.isArray(chats) && chats.length > 0 ? (
				[...chats]
					.sort((a, b) => {
						if (!a.createdAt && !b.createdAt) return 0;
						if (!a.createdAt) return 1;
						if (!b.createdAt) return -1;
						return b.createdAt.localeCompare(a.createdAt);
					})
					.map((chat, index) => (
						<div
							key={index}
							className={`group hover:bg-gray-200 rounded cursor-pointer flex justify-between items-center transition-colors duration-200 ${
								currentChatId === chat._id ? "bg-gray-200" : ""
							}`}
						>
							<div
								onClick={() => onChatSelect(chat._id)}
								className="p-2 px-4 flex-1 truncate"
								title={chat.name || `Chat ${index + 1}`}
							>
								{chat.name || `Chat ${index + 1}`}
							</div>
							<button
								onClick={() => onDeleteChat(chat._id)}
								className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-red-100 rounded mr-2"
								title="Delete chat"
							>
								<MdOutlineDelete
									className="text-red-500 hover:text-red-700"
									size={18}
								/>
							</button>
						</div>
					))
			) : (
				<p className="text-gray-500 text-center py-4">No chats available</p>
			)}
		</div>
	);
};

export default ChatList;
