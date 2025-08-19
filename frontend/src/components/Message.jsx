import React, { useState } from "react";
import { IoCopyOutline } from "react-icons/io5";
import { MdOutlineDelete } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const Message = ({ message, isUser, showActions = true, onDelete }) => {
	const [showCopyIcon, setShowCopyIcon] = useState(false);
	const [copied, setCopied] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);

	const handleCopy = async () => {
		const textToCopy = isUser ? message.prompt : message.result;
		try {
			await navigator.clipboard.writeText(textToCopy);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

	const handleDeleteClick = () => {
		setShowDeleteModal(true);
	};

	const handleDeleteConfirm = async () => {
		if (onDelete && message._id) {
			setDeleteLoading(true);
			try {
				await onDelete(message._id);
				setShowDeleteModal(false);
			} catch (error) {
				console.error("Error deleting message:", error);
			} finally {
				setDeleteLoading(false);
			}
		}
	};

	const handleDeleteCancel = () => {
		setShowDeleteModal(false);
	};

	return (
		<>
			<div
				className={`relative group ${
					isUser ? "flex justify-end" : "flex justify-start"
				}`}
				onMouseEnter={() => !isUser && showActions && setShowCopyIcon(true)}
				onMouseLeave={() => !isUser && showActions && setShowCopyIcon(false)}
			>
				{/* AI Icon for AI messages */}
				{!isUser && (
					<div className="flex items-start mr-3 mt-1">
						<div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
							AI
						</div>
					</div>
				)}

				<div className="flex flex-col">
					<div
						className={`max-w-3xl px-4 py-3 rounded-lg text-sm whitespace-pre-wrap ${
							isUser
								? " text-gray-800 border  border-gray-200 bg-white"
								: "bg-white text-gray-800 border border-gray-200 shadow-sm"
						}`}
					>
						<div
							dangerouslySetInnerHTML={{
								__html: isUser
								? message.prompt || ""
								: (message.result || ""
									? message.result.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
									: ""),
							}}
							/>
					</div>

					{/* Action buttons - only for AI messages */}
					{!isUser && showActions && showCopyIcon && (
						<div className="flex gap-1 mt-2 ml-1">
							{/* Copy button */}
							<button
								onClick={handleCopy}
								className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded transition-colors duration-200"
								title={copied ? "Copied!" : "Copy message"}
							>
								<IoCopyOutline
									size={14}
									className={copied ? "text-green-500" : "text-gray-600"}
								/>
							</button>

							{/* Delete button */}
							<button
								onClick={handleDeleteClick}
								className="p-1.5 bg-gray-100 hover:bg-red-100 rounded transition-colors duration-200"
								title="Delete message"
							>
								<MdOutlineDelete
									size={14}
									className="text-gray-600 hover:text-red-600"
								/>
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			{showDeleteModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
						<div className="flex items-center mb-4">
							<div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
								<MdOutlineDelete
									className="text-red-600"
									size={20}
								/>
							</div>
							<h3 className="text-lg font-semibold text-gray-900">
								Delete Message
							</h3>
						</div>

						<p className="text-gray-600 mb-6">
							Are you sure you want to delete this message? This action cannot
							be undone.
						</p>

						<div className="flex gap-3">
							<button
								onClick={handleDeleteCancel}
								disabled={deleteLoading}
								className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 disabled:opacity-50"
							>
								Cancel
							</button>
							<button
								onClick={handleDeleteConfirm}
								disabled={deleteLoading}
								className="flex-1 px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
							>
								{deleteLoading ? (
									<>
										<AiOutlineLoading3Quarters
											className="animate-spin"
											size={16}
										/>
										Deleting...
									</>
								) : (
									"Delete"
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default Message;
