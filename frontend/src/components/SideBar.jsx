import React, { useContext, useEffect, useState } from "react";
import { Context } from "../Context/Main";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ChatList from "./ChatList";
import UserProfile from "./UserProfile";
import { FiSidebar } from "react-icons/fi";
import { MdOutlineDelete } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function SideBar({ isOpen, setIsOpen }) {
	const navigator = useNavigate();
	const { chatId } = useParams();
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [logoutLoading, setLogoutLoading] = useState(false);
	const [createChatLoading, setCreateChatLoading] = useState(false);

	const { userData, userChats, fetchChats, fetchMessages, setCurrentChat } =
		useContext(Context);

	useEffect(() => {
		fetchChats(userData?._id);
	}, [userData]);

	const userChatHistory = async (id) => {
		setCurrentChat(id);
		fetchMessages(id);
		console.log("id == ", id);
		navigator(`/chat/${id}`);
		// Close sidebar on mobile after selecting a chat
		if (window.innerWidth < 768) {
			setIsOpen(false);
		}
	};

	const Logout = async () => {
		setLogoutLoading(true);
		try {
			await axios.post(
				"http://localhost:8000/api/user/logout",
				{},
				{
					withCredentials: true,
				}
			);
			localStorage.clear();
			navigator("/login");
			setCurrentChat(null);
		} catch (error) {
			console.error("Logout failed:", error);
		} finally {
			setLogoutLoading(false);
		}
	};

	const deleteAllHistory = async () => {
		setDeleteLoading(true);
		try {
			await axios.delete(`http://localhost:8000/api/chat/deletehistory/`, {
				withCredentials: true,
			});
			fetchChats(userData._id);
			navigator("/chat");
			setShowDeleteModal(false);
		} catch (error) {
			console.error("Error deleting all history:", error);
		} finally {
			setDeleteLoading(false);
		}
	};

	const createChat = async () => {
		setCreateChatLoading(true);
		try {
			const res = await axios.post(
				"http://localhost:8000/api/chat/createChat",
				{ userId: userData._id, chatName: "new chat" },
				{
					withCredentials: true,
				}
			);
			if (res.data) {
				console.log(res.data);
				fetchChats(userData._id);
				userChatHistory(res.data.chat._id);
			}
		} catch (error) {
			console.error("Error creating chat:", error);
		} finally {
			setCreateChatLoading(false);
		}
	};

	const deleteChat = async (id) => {
		try {
			await axios.delete(
				`http://localhost:8000/api/chat/deleteChatById/${id}`,
				{
					withCredentials: true,
				}
			);
			fetchChats(userData._id);
			// If we're deleting the current chat, navigate to home
			if (chatId === id) {
				navigator("/chat");
			}
		} catch (error) {
			console.error("Error deleting chat:", error);
		}
	};

	return (
		<>
			{/* Mobile overlay */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
					onClick={() => setIsOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`fixed md:relative z-50 border bg-[#f1f2f3] border-gray-300 py-4 flex flex-col justify-between h-full transition-all duration-300 ease-in-out ${
					isOpen
						? "translate-x-0 w-80"
						: "-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden"
				} md:min-w-0`}
			>
				<div className="w-80 md:w-70 flex flex-col h-full">
					<div className="flex items-center justify-between gap-2 mb-4 px-4">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
								AI
							</div>
							<h1 className="text-base font-bold md:text-2xl">Virox AI</h1>
						</div>
						<button
							onClick={() => setIsOpen(false)}
							className="p-1 hover:bg-gray-200 rounded transition-colors"
							title="Close sidebar"
						>
							<FiSidebar size={20} />
						</button>
					</div>

					<div className="flex-1 overflow-y-auto px-2">
						<button
							onClick={createChat}
							disabled={createChatLoading}
							className="w-full bg-blue-500 text-white py-2 mt-5 rounded mb-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							{createChatLoading ? (
								<>
									<AiOutlineLoading3Quarters
										className="animate-spin"
										size={16}
									/>
									Creating...
								</>
							) : (
								"+ New chat"
							)}
						</button>

						<ChatList
							chats={userChats}
							onChatSelect={userChatHistory}
							onDeleteChat={deleteChat}
							currentChatId={chatId}
						/>
					</div>
				</div>

				<UserProfile
					userData={userData}
					onLogout={Logout}
					onDeleteHistory={() => setShowDeleteModal(true)}
					logoutLoading={logoutLoading}
				/>
			</aside>

			{/* Toggle button for both mobile and desktop */}
			{!isOpen && (
				<button
					onClick={() => setIsOpen(true)}
					className="fixed top-4 left-4 z-30 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
					title="Open sidebar"
				>
					<FiSidebar size={20} />
				</button>
			)}

			{/* Delete All History Confirmation Modal */}
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
								Delete All History
							</h3>
						</div>

						<p className="text-gray-600 mb-6">
							Are you sure you want to delete all your chat history? This action
							cannot be undone.
						</p>

						<div className="flex gap-3">
							<button
								onClick={() => setShowDeleteModal(false)}
								disabled={deleteLoading}
								className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 disabled:opacity-50"
							>
								Cancel
							</button>
							<button
								onClick={deleteAllHistory}
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
									"Delete All"
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
