import React from "react";

export default function ChatHome() {
	return (
		<div className="flex items-center justify-center h-full">
			<div className="text-center">
				<h2 className="text-2xl font-semibold text-gray-700 mb-2">
					Welcome to Virox AI
				</h2>
				<p className="text-gray-500">
					Select a chat from the sidebar or create a new one to get started.
				</p>
			</div>
		</div>
	);
}
