import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../Context/Main";
import axios from "axios";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdOutlineArrowBack } from "react-icons/md";

export default function UpdateProfile() {
	const { userData, setUserData } = useContext(Context);
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		profilePic: null,
	});

	const [previewImage, setPreviewImage] = useState("");

	useEffect(() => {
		if (userData) {
			setFormData({
				firstName: userData.firstName || "",
				lastName: userData.lastName || "",
				profilePic: null,
			});
			setPreviewImage(userData.profilePic || "");
		}
	}, [userData]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			// Validate file type
			if (!file.type.startsWith("image/")) {
				setError("Please select a valid image file");
				return;
			}

			// Validate file size (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				setError("Image size should be less than 5MB");
				return;
			}

			setFormData((prev) => ({
				...prev,
				profilePic: file,
			}));

			// Create preview
			const reader = new FileReader();
			reader.onload = (e) => {
				setPreviewImage(e.target.result);
			};
			reader.readAsDataURL(file);
			setError("");
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.firstName.trim() || !formData.lastName.trim()) {
			setError("First name and last name are required");
			return;
		}

		setLoading(true);
		setError("");
		setSuccess("");

		try {
			const data = new FormData();
			data.append("firstName", formData.firstName.trim());
			data.append("lastName", formData.lastName.trim());

			if (formData.profilePic) {
				data.append("image", formData.profilePic);
			}

			const response = await axios.put("http://localhost:8000/api/user/update-user", data, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
				withCredentials: true,
			});

			if (response.data) {
				// Update local storage and context
				const updatedUser = { ...userData, ...response.data };
				localStorage.setItem("user", JSON.stringify(updatedUser));
				setUserData(updatedUser);

				setSuccess("Profile updated successfully!");
				setTimeout(() => {
					navigate("/chat");
				}, 1500);
			}
		} catch (error) {
			console.error("Error updating profile:", error);
			setError(
				error.response?.data?.message ||
					"Failed to update profile. Please try again."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			{/* Header */}
			<div className="bg-white border-b border-gray-200 px-4 py-3">
				<div className="max-w-2xl mx-auto flex items-center gap-3">
					<button
						onClick={() => navigate("/chat")}
						className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
						title="Back to chat"
					>
						<MdOutlineArrowBack
							size={20}
							className="text-gray-600"
						/>
					</button>
					<h1 className="text-xl font-semibold text-gray-900">
						Update Profile
					</h1>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex items-center justify-center px-4 py-8">
				<div className="w-full max-w-md">
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						{/* Profile Picture Section */}
						<div className="text-center mb-6">
							<div className="relative inline-block">
								<div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
									{previewImage ? (
										<img
											src={previewImage}
											alt="Profile"
											className="w-full h-full object-cover"
										/>
									) : (
										(userData?.firstName?.charAt(0) || "U").toUpperCase()
									)}
								</div>
								<label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
									<input
										type="file"
										accept="image/*"
										onChange={handleImageChange}
										className="hidden"
									/>
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 6v6m0 0v6m0-6h6m-6 0H6"
										/>
									</svg>
								</label>
							</div>
							<p className="text-sm text-gray-500 mt-2">
								Click to change profile picture
							</p>
						</div>

						{/* Error and Success Messages */}
						{error && (
							<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-red-600 text-sm">{error}</p>
							</div>
						)}

						{success && (
							<div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
								<p className="text-green-600 text-sm">{success}</p>
							</div>
						)}

						{/* Form */}
						<form
							onSubmit={handleSubmit}
							className="space-y-4"
						>
							<div>
								<label
									htmlFor="firstName"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									First Name
								</label>
								<input
									type="text"
									id="firstName"
									name="firstName"
									value={formData.firstName}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									required
								/>
							</div>

							<div>
								<label
									htmlFor="lastName"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Last Name
								</label>
								<input
									type="text"
									id="lastName"
									name="lastName"
									value={formData.lastName}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									required
								/>
							</div>

							<button
								type="submit"
								disabled={loading}
								className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
							>
								{loading ? (
									<>
										<AiOutlineLoading3Quarters
											className="animate-spin"
											size={20}
										/>
										Updating Profile...
									</>
								) : (
									"Update Profile"
								)}
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
