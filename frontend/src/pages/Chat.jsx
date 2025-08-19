import React, { useState, useRef, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { Context } from "../Context/Main";
import axios from "axios";
import Message from "../components/Message";
import MessageInput from "../components/MessageInput";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Chat() {
	const { chatId } = useParams();
	const { userData, setCurrentChat, userMessages, fetchChats, fetchMessages } =
		useContext(Context);
	const [loading, setLoading] = useState(false);
	const [exporting, setExporting] = useState(false);
	const messagesEndRef = useRef(null);
	const messagesContainerRef = useRef(null);

	useEffect(() => {
		if (chatId && userData) {
			setCurrentChat(chatId);
			fetchMessages(chatId);
		}
	}, [chatId, userData]);

	// Auto scroll to bottom when new messages arrive
	useEffect(() => {
		const scrollToBottom = () => {
			messagesEndRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "end",
			});
		};

		const timeoutId = setTimeout(scrollToBottom, 100);
		return () => clearTimeout(timeoutId);
	}, [userMessages]);

	const handleSend = async (message) => {
		if (!chatId) return;
		setLoading(true);

		try {
			await axios.post(
				`http://localhost:8000/api/message/query`,
				{ message, chatId },
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);
			fetchMessages(chatId);
			fetchChats(userData._id);
			setLoading(false);
		} catch (error) {
			console.error("Error sending message:", error);
			fetchMessages(chatId);
			fetchChats(userData._id);
			setLoading(false);
		}
	};

	const handleDeleteMessage = async (messageId) => {
		try {
			await axios.delete(`http://localhost:8000/api/message/deleteMessage/${messageId}`, {
				withCredentials: true,
			});
			fetchMessages(chatId);
		} catch (error) {
			console.error("Error deleting message:", error);
		}
	};

	const handleExportPDF = async () => {
		if (!userMessages || userMessages.length === 0) {
			alert("No messages to export!");
			return;
		}

		setExporting(true);
		try {
			// Create a temporary container for PDF generation
			const tempContainer = document.createElement("div");
			tempContainer.style.position = "absolute";
			tempContainer.style.left = "-9999px";
			tempContainer.style.top = "0";
			tempContainer.style.width = "800px";
			tempContainer.style.backgroundColor = "white";
			tempContainer.style.padding = "40px";
			tempContainer.style.fontFamily = "Arial, sans-serif";
			tempContainer.style.fontSize = "14px";
			tempContainer.style.lineHeight = "1.6";
			document.body.appendChild(tempContainer);

			// Add header
			const header = document.createElement("div");
			header.innerHTML = `
				<h1 style="color: #333; font-size: 24px; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
					Chat Conversation
				</h1>
				<p style="color: #666; margin-bottom: 30px;">
					Exported on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
				</p>
			`;
			tempContainer.appendChild(header);

			// Add messages
			userMessages.forEach((msg, index) => {
				const messageDiv = document.createElement("div");
				messageDiv.style.marginBottom = "30px";
				messageDiv.style.pageBreakInside = "avoid";

				messageDiv.innerHTML = `
					<div style="margin-bottom: 15px;">
						<div style="background-color: #3b82f6; color: white; padding: 12px 16px; border-radius: 18px; display: inline-block; max-width: 70%; margin-bottom: 8px;">
							<strong>You:</strong><br>
							${msg.prompt || "No message content"}
						</div>
					</div>
					<div style="margin-bottom: 15px;">
						<div style="background-color: #f3f4f6; color: #333; padding: 12px 16px; border-radius: 18px; display: inline-block; max-width: 70%; margin-left: auto; margin-bottom: 8px;">
							<strong>AI:</strong><br>
							${msg.result || "No response content"}
						</div>
					</div>
				`;
				tempContainer.appendChild(messageDiv);
			});

			// Convert to canvas and then to PDF
			const canvas = await html2canvas(tempContainer, {
				scale: 2,
				useCORS: true,
				allowTaint: true,
				backgroundColor: "#ffffff",
			});

			// Remove temporary container
			document.body.removeChild(tempContainer);

			// Create PDF
			const imgData = canvas.toDataURL("image/png");
			const pdf = new jsPDF("p", "mm", "a4");
			const imgWidth = 210;
			const pageHeight = 295;
			const imgHeight = (canvas.height * imgWidth) / canvas.width;
			let heightLeft = imgHeight;

			let position = 0;

			pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
			heightLeft -= pageHeight;

			while (heightLeft >= 0) {
				position = heightLeft - imgHeight;
				pdf.addPage();
				pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
				heightLeft -= pageHeight;
			}

			// Save the PDF
			const fileName = `chat_export_${
				new Date().toISOString().split("T")[0]
			}.pdf`;
			pdf.save(fileName);
		} catch (error) {
			console.error("Error exporting PDF:", error);
			alert("Failed to export PDF. Please try again.");
		} finally {
			setExporting(false);
		}
	};

	return (
		<div className="flex flex-col h-full bg-white relative">
			{/* Export Button - Fixed Position */}
			<button
				onClick={handleExportPDF}
				disabled={exporting || !userMessages || userMessages.length === 0}
				className="fixed top-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2"
			>
				{exporting ? (
					<>
						<svg
							className="animate-spin h-4 w-4"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							></circle>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Exporting...
					</>
				) : (
					<>
						<svg
							className="h-4 w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						Export PDF
					</>
				)}
			</button>

			{/* Messages Container */}
			<div
				className="flex-1 overflow-y-auto px-4 py-12"
				ref={messagesContainerRef}
			>
				{Array.isArray(userMessages) && userMessages.length > 0 ? (
					<div className="max-w-4xl mx-auto space-y-6">
						{userMessages.map((msg, i) => (
							<div key={i} className="space-y-4">
								{/* User message */}
								{msg && (
								<Message
									message={msg}
									isUser={true}
									showActions={false}
								/>
								)}

								{/* Bot message */}
								{msg?.result && (
								<Message
									message={msg}
									isUser={false}
									showActions={true}
									onDelete={() => handleDeleteMessage(msg._id)}
								/>
								)}
							</div>
							))}
					</div>
				) : (
					<div className="flex items-center justify-center h-full px-4">
						<div className="text-center max-w-md">
							<h2 className="text-2xl font-semibold text-gray-700 mb-3">
								Start a conversation
							</h2>
							<p className="text-gray-500 leading-relaxed">
								Type your first message below to begin chatting with AI.
							</p>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Message Input */}
			<div className="border-t border-gray-200 bg-white">
				<MessageInput
					onSend={handleSend}
					loading={loading}
				/>
			</div>
		</div>
	);
}
