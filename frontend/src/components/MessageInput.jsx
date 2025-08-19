import React, { useState } from "react";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const MessageInput = ({ onSend, loading }) => {
	const [input, setInput] = useState("");

	const handleSend = async () => {
		if (input.trim() === "") return;
		await onSend(input);
		setInput("");
	};

	const handleKeyDown = async (e) => {
		if (e.key === "Enter") {
			await handleSend();
		}
	};

	return (
		<div className="p-4   bottom-5 border-gray-200">
			<div className="flex items-center gap-2">
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Type your message..."
					className="flex-1 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<button
					onClick={handleSend}
					disabled={loading}
					className="bg-blue-500 hover:bg-blue-600 p-3 rounded-lg text-white"
				>
					{loading ? (
						<AiOutlineLoading3Quarters
							className="animate-spin"
							size={25}
						/>
					) : (
						<PaperPlaneIcon className="w-5 h-5" />
					)}
				</button>
			</div>
		</div>
	);
};

export default MessageInput;
