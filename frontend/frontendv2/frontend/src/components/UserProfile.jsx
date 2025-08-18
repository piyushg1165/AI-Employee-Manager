import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { IoEllipsisVertical } from "react-icons/io5";
import {
	MdOutlineLogout,
	MdOutlineDelete,
	MdOutlinePerson,
	MdOutlineUpload,
} from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import axios from "axios";

const UserProfile = ({
	userData,
	onLogout,
	onDeleteHistory,
	logoutLoading = false,
}) => {
	const [showMenu, setShowMenu] = useState(false);
	const [showProfileModal, setShowProfileModal] = useState(false);
	const [showEmployeeModal, setShowEmployeeModal] = useState(false);
	const [showExcelUploadModal, setShowExcelUploadModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const [employeeLoading, setEmployeeLoading] = useState(false);
	const [excelUploadLoading, setExcelUploadLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [selectedFile, setSelectedFile] = useState(null);
	const [fileName, setFileName] = useState("");
	const [toast, setToast] = useState({ show: false, message: "", type: "" });
	const [employeeForm, setEmployeeForm] = useState({
		employee_id: "",
		name: "",
		email: "",
		phone: "",
		position: "",
		joining_date: "",
		employment_type: "",
		department: "",
		location: "",
		manager: "",
		experience_years: "",
		is_remote: false,
		skills: [],
		projects: [],
	});

	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		profilePic: null,
	});

	const [previewImage, setPreviewImage] = useState("");
	const menuRef = useRef(null);
	const modalRef = useRef(null);

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setShowMenu(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Close modal when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (modalRef.current && !modalRef.current.contains(event.target)) {
				setShowProfileModal(false);
			}
		};

		if (showProfileModal) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showProfileModal]);

	// Initialize form data when modal opens
	useEffect(() => {
		if (showProfileModal && userData) {
			setFormData({
				firstName: userData.firstName || "",
				lastName: userData.lastName || "",
				profilePic: null,
			});
			setPreviewImage(userData.profilePic || "");
			setError("");
			setSuccess("");
		}
	}, [showProfileModal, userData]);

	const handleLogout = () => {
		if (!logoutLoading) {
			setShowMenu(false);
			onLogout();
		}
	};

	const handleDeleteHistory = () => {
		setShowMenu(false);
		onDeleteHistory();
	};

	const handleUpdateProfile = () => {
		setShowMenu(false);
		setShowProfileModal(true);
	};

	const handleAddEmployee = () => {
		setShowMenu(false);
		setShowEmployeeModal(true);
	};

	const handleExcelUploadClick = () => {
		setShowMenu(false);
		setShowExcelUploadModal(true);
	};

	const showToast = (message, type = "success") => {
		setToast({ show: true, message, type });
		setTimeout(() => {
			setToast({ show: false, message: "", type: "" });
		}, 4000);
	};

	const addEmployee = async () => {
		setEmployeeLoading(true);
		try {
			const response = await axios.post(
				"/api/employee/upload-employee",
				employeeForm,
				{
					withCredentials: true,
				}
			);
			if (response.data) {
				console.log("Employee added successfully:", response.data);
				setShowEmployeeModal(false);
				// Reset form
				setEmployeeForm({
					employee_id: "",
					name: "",
					email: "",
					phone: "",
					position: "",
					joining_date: "",
					employment_type: "",
					department: "",
					location: "",
					manager: "",
					experience_years: "",
					is_remote: false,
					skills: [],
					projects: [],
				});
			}
		} catch (error) {
			console.error("Error adding employee:", error);
		} finally {
			setEmployeeLoading(false);
		}
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			// Validate file type
			const validTypes = [
				"application/vnd.ms-excel",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				".xls",
				".xlsx",
			];

			const isValidType = validTypes.some(
				(type) => file.type === type || file.name.toLowerCase().endsWith(type)
			);

			if (!isValidType) {
				setError("Please select a valid Excel file (.xls or .xlsx)");
				return;
			}

			// Validate file size (max 10MB)
			if (file.size > 10 * 1024 * 1024) {
				setError("File size should be less than 10MB");
				return;
			}

			setSelectedFile(file);
			setFileName(file.name);
			setError("");
		}
	};

	const handleExcelUpload = async () => {
		if (!selectedFile) {
			setError("Please select an Excel file");
			return;
		}

		setExcelUploadLoading(true);
		setError("");
		setSuccess("");

		try {
			const formData = new FormData();
			formData.append("file", selectedFile);

			const response = await axios.post(
				"/api/employee/upload-excel-employee",
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
					withCredentials: true,
				}
			);

			if (response.data) {
				showToast("Excel file uploaded successfully!");
				setSelectedFile(null);
				setFileName("");
				setTimeout(() => {
					setShowExcelUploadModal(false);
				}, 1500);
			}
		} catch (error) {
			console.error("Error uploading Excel file:", error);
			const errorMessage =
				error.response?.data?.message ||
				"Failed to upload Excel file. Please try again.";
			showToast(errorMessage, "error");
		} finally {
			setExcelUploadLoading(false);
		}
	};

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

			const response = await axios.put("/api/user/update-user", data, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
				withCredentials: true,
			});

			if (response.data) {
				// Update local storage and context
				const updatedUser = { ...userData, ...response.data };
				localStorage.setItem("user", JSON.stringify(updatedUser));

				setSuccess("Profile updated successfully!");
				setTimeout(() => {
					setShowProfileModal(false);
					window.location.reload(); // Refresh to update context
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
		<>
			<div className="text-sm flex flex-col gap-3 text-gray-700 border-gray-300 px-4 py-2">
				<div className="flex items-center justify-between">
					<div className="flex gap-3 rounded-xl cursor-pointer hover:bg-gray-200 px-3 py-2 flex-1">
						<div className="w-8 h-8 flex items-center justify-center rounded-full overflow-hidden">
							{userData?.profilePic ? (
								<img
									src={userData.profilePic}
									alt="Profile"
									className="w-full h-full object-cover"
									onError={(e) => {
										e.target.style.display = "none";
										e.target.nextSibling.style.display = "flex";
									}}
								/>
							) : null}
							<div
								className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-pink-500 text-white font-semibold text-sm ${
									userData?.profilePic ? "hidden" : "flex"
								}`}
							>
								{userData?.firstName?.charAt(0)?.toUpperCase() || "U"}
							</div>
						</div>
						<div>
							<p className="font-semibold">
								{userData?.firstName} {userData?.lastName}
							</p>
							<p className="text-gray-500">Free</p>
						</div>
					</div>

					{/* Three dots menu button */}
					<div
						className="relative"
						ref={menuRef}
					>
						<button
							onClick={() => setShowMenu(!showMenu)}
							className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
							title="More options"
						>
							<IoEllipsisVertical
								size={20}
								className="text-gray-600"
							/>
						</button>

						{/* Dropdown menu */}
						{showMenu && (
							<div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
								<button
									onClick={handleUpdateProfile}
									className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 transition-colors duration-200"
								>
									<MdOutlinePerson
										size={18}
										className="text-gray-600"
									/>
									<span>Update Profile</span>
								</button>

								<button
									onClick={handleAddEmployee}
									className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 transition-colors duration-200"
								>
									<svg
										className="w-4 h-4 text-gray-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 4v16m8-8H4"
										/>
									</svg>
									<span>Add Employee</span>
								</button>

								<button
									onClick={handleExcelUploadClick}
									className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 transition-colors duration-200"
								>
									<MdOutlineUpload
										size={18}
										className="text-gray-600"
									/>
									<span>Upload Excel</span>
								</button>

								<button
									onClick={handleDeleteHistory}
									className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 transition-colors duration-200"
								>
									<MdOutlineDelete
										size={18}
										className="text-gray-600"
									/>
									<span>Delete All History</span>
								</button>

								<hr className="my-1 border-gray-200" />

								<button
									onClick={handleLogout}
									disabled={logoutLoading}
									className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-red-50 text-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{logoutLoading ? (
										<AiOutlineLoading3Quarters
											className="animate-spin"
											size={18}
										/>
									) : (
										<MdOutlineLogout size={18} />
									)}
									<span>{logoutLoading ? "Logging out..." : "Logout"}</span>
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Update Profile Modal */}
			{showProfileModal &&
				createPortal(
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
						<div
							ref={modalRef}
							className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
						>
							{/* Modal Header */}
							<div className="flex items-center justify-between p-6 border-b border-gray-200">
								<h2 className="text-xl font-semibold text-gray-900">
									Update Profile
								</h2>
								<button
									onClick={() => setShowProfileModal(false)}
									className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
									title="Close"
								>
									<svg
										className="w-5 h-5 text-gray-500"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>

							{/* Modal Content */}
							<div className="p-6">
								{/* Profile Picture Section */}
								<div className="text-center mb-6">
									<div className="relative inline-block">
										<div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
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
										<label className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
											<input
												type="file"
												accept="image/*"
												onChange={handleImageChange}
												className="hidden"
											/>
											<svg
												className="w-3 h-3"
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

									<div className="flex gap-3 pt-4">
										<button
											type="button"
											onClick={() => setShowProfileModal(false)}
											disabled={loading}
											className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 disabled:opacity-50"
										>
											Cancel
										</button>
										<button
											type="submit"
											disabled={loading}
											className="flex-1 px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
										>
											{loading ? (
												<>
													<AiOutlineLoading3Quarters
														className="animate-spin"
														size={16}
													/>
													Updating...
												</>
											) : (
												"Update Profile"
											)}
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>,
					document.body
				)}

			{/* Add Employee Modal */}
			{showEmployeeModal &&
				createPortal(
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
						<div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
							{/* Modal Header */}
							<div className="flex items-center justify-between p-6 border-b border-gray-200">
								<h2 className="text-xl font-semibold text-gray-900">
									Add Employee Information
								</h2>
								<button
									onClick={() => setShowEmployeeModal(false)}
									className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
									title="Close"
								>
									<svg
										className="w-5 h-5 text-gray-500"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>

							{/* Modal Content */}
							<div className="p-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* Employee ID */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Employee ID *
										</label>
										<input
											type="text"
											value={employeeForm.employee_id}
											onChange={(e) =>
												setEmployeeForm({
													...employeeForm,
													employee_id: e.target.value,
												})
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											placeholder="EMP002"
											required
										/>
									</div>

									{/* Name */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Full Name *
										</label>
										<input
											type="text"
											value={employeeForm.name}
											onChange={(e) =>
												setEmployeeForm({
													...employeeForm,
													name: e.target.value,
												})
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											placeholder="Aarav Mehta"
											required
										/>
									</div>

									{/* Email */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Email *
										</label>
										<input
											type="email"
											value={employeeForm.email}
											onChange={(e) =>
												setEmployeeForm({
													...employeeForm,
													email: e.target.value,
												})
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											placeholder="aarav.mehta@example.com"
											required
										/>
									</div>

									{/* Phone */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Phone *
										</label>
										<input
											type="tel"
											value={employeeForm.phone}
											onChange={(e) =>
												setEmployeeForm({
													...employeeForm,
													phone: e.target.value,
												})
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											placeholder="+91-9123456780"
											required
										/>
									</div>

									{/* Position */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Position *
										</label>
										<select
											value={employeeForm.position}
											onChange={(e) =>
												setEmployeeForm({
													...employeeForm,
													position: e.target.value,
												})
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											required
										>
											<option value="">Select Position</option>
											<option value="Frontend Developer">
												Frontend Developer
											</option>
											<option value="Backend Developer">
												Backend Developer
											</option>
											<option value="Full Stack Developer">
												Full Stack Developer
											</option>
											<option value="DevOps Engineer">DevOps Engineer</option>
											<option value="Data Scientist">Data Scientist</option>
											<option value="Product Manager">Product Manager</option>
											<option value="UI/UX Designer">UI/UX Designer</option>
											<option value="QA Engineer">QA Engineer</option>
										</select>
									</div>

									{/* Joining Date */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Joining Date *
										</label>
										<input
											type="date"
											value={employeeForm.joining_date}
											onChange={(e) =>
												setEmployeeForm({
													...employeeForm,
													joining_date: e.target.value,
												})
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											required
										/>
									</div>

									{/* Employment Type */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Employment Type *
										</label>
										<select
											value={employeeForm.employment_type}
											onChange={(e) =>
												setEmployeeForm({
													...employeeForm,
													employment_type: e.target.value,
												})
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											required
										>
											<option value="">Select Type</option>
											<option value="Full-time">Full-time</option>
											<option value="Part-time">Part-time</option>
											<option value="Contract">Contract</option>
											<option value="Intern">Intern</option>
										</select>
									</div>

									{/* Department */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Department *
										</label>
										<select
											value={employeeForm.department}
											onChange={(e) =>
												setEmployeeForm({
													...employeeForm,
													department: e.target.value,
												})
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											required
										>
											<option value="">Select Department</option>
											<option value="Engineering">Engineering</option>
											<option value="Design">Design</option>
											<option value="Product">Product</option>
											<option value="Marketing">Marketing</option>
											<option value="Sales">Sales</option>
											<option value="HR">HR</option>
											<option value="Finance">Finance</option>
										</select>
									</div>

									{/* Location */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Location *
										</label>
										<select
											value={employeeForm.location}
											onChange={(e) =>
												setEmployeeForm({
													...employeeForm,
													location: e.target.value,
												})
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											required
										>
											<option value="">Select Location</option>
											<option value="Bangalore">Bangalore</option>
											<option value="Mumbai">Mumbai</option>
											<option value="Delhi">Delhi</option>
											<option value="Hyderabad">Hyderabad</option>
											<option value="Chennai">Chennai</option>
											<option value="Pune">Pune</option>
											<option value="Remote">Remote</option>
										</select>
									</div>

									{/* Manager */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Manager *
										</label>
										<input
											type="text"
											value={employeeForm.manager}
											onChange={(e) =>
												setEmployeeForm({
													...employeeForm,
													manager: e.target.value,
												})
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											placeholder="Sneha Kapoor"
											required
										/>
									</div>

									{/* Experience Years */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Experience (Years) *
										</label>
										<input
											type="number"
											min="0"
											max="50"
											value={employeeForm.experience_years}
											onChange={(e) =>
												setEmployeeForm({
													...employeeForm,
													experience_years: parseInt(e.target.value) || "",
												})
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											placeholder="4"
											required
										/>
									</div>

									{/* Remote Work */}
									<div className="md:col-span-2">
										<label className="flex items-center gap-2">
											<input
												type="checkbox"
												checked={employeeForm.is_remote}
												onChange={(e) =>
													setEmployeeForm({
														...employeeForm,
														is_remote: e.target.checked,
													})
												}
												className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
											/>
											<span className="text-sm font-medium text-gray-700">
												Remote Work
											</span>
										</label>
									</div>

									{/* Skills */}
									<div className="md:col-span-2">
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Skills *
										</label>
										<select
											multiple
											value={employeeForm.skills}
											onChange={(e) => {
												const selectedOptions = Array.from(
													e.target.selectedOptions,
													(option) => option.value
												);
												setEmployeeForm({
													...employeeForm,
													skills: selectedOptions,
												});
											}}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
											required
										>
											<option value="JavaScript">JavaScript</option>
											<option value="React">React</option>
											<option value="Node.js">Node.js</option>
											<option value="Express">Express</option>
											<option value="MongoDB">MongoDB</option>
											<option value="TypeScript">TypeScript</option>
											<option value="Docker">Docker</option>
											<option value="Python">Python</option>
											<option value="Java">Java</option>
											<option value="AWS">AWS</option>
											<option value="Git">Git</option>
											<option value="SQL">SQL</option>
										</select>
										<p className="text-xs text-gray-500 mt-1">
											Hold Ctrl/Cmd to select multiple skills
										</p>
									</div>

									{/* Projects */}
									<div className="md:col-span-2">
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Projects *
										</label>
										<select
											multiple
											value={employeeForm.projects}
											onChange={(e) => {
												const selectedOptions = Array.from(
													e.target.selectedOptions,
													(option) => option.value
												);
												setEmployeeForm({
													...employeeForm,
													projects: selectedOptions,
												});
											}}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
											required
										>
											<option value="API Gateway">API Gateway</option>
											<option value="Authentication Service">
												Authentication Service
											</option>
											<option value="E-commerce Platform">
												E-commerce Platform
											</option>
											<option value="Mobile App">Mobile App</option>
											<option value="Dashboard">Dashboard</option>
											<option value="Payment System">Payment System</option>
											<option value="CRM System">CRM System</option>
											<option value="Analytics Platform">
												Analytics Platform
											</option>
										</select>
										<p className="text-xs text-gray-500 mt-1">
											Hold Ctrl/Cmd to select multiple projects
										</p>
									</div>
								</div>

								{/* Action Buttons */}
								<div className="flex gap-3 pt-6">
									<button
										type="button"
										onClick={() => setShowEmployeeModal(false)}
										disabled={employeeLoading}
										className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 disabled:opacity-50"
									>
										Cancel
									</button>
									<button
										onClick={addEmployee}
										disabled={employeeLoading}
										className="flex-1 px-4 py-2 text-white bg-gray-900 hover:bg-black rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
									>
										{employeeLoading ? (
											<>
												<AiOutlineLoading3Quarters
													className="animate-spin"
													size={16}
												/>
												Adding Employee...
											</>
										) : (
											"Add Employee"
										)}
									</button>
								</div>
							</div>
						</div>
					</div>,
					document.body
				)}

			{/* Excel Upload Modal */}
			{showExcelUploadModal &&
				createPortal(
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
						<div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
							{/* Modal Header */}
							<div className="flex items-center justify-between p-6 border-b border-gray-200">
								<h2 className="text-xl font-semibold text-gray-900">
									Upload Employee Excel
								</h2>
								<button
									onClick={() => setShowExcelUploadModal(false)}
									className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
									title="Close"
								>
									<svg
										className="w-5 h-5 text-gray-500"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>

							{/* Modal Content */}
							<div className="p-6">
								{/* File Upload Section */}
								<div className="mb-6">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Select Excel File
									</label>
									<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
										<input
											type="file"
											accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
											onChange={handleFileChange}
											className="hidden"
											id="excel-file-input"
										/>
										<label
											htmlFor="excel-file-input"
											className="cursor-pointer"
										>
											<MdOutlineUpload
												size={48}
												className="mx-auto text-gray-400 mb-2"
											/>
											<p className="text-sm text-gray-600 mb-1">
												Click to upload or drag and drop
											</p>
											<p className="text-xs text-gray-500">
												Excel files (.xls, .xlsx) up to 10MB
											</p>
										</label>
									</div>
									{fileName && (
										<div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
											<p className="text-sm text-green-700">
												Selected file:{" "}
												<span className="font-medium">{fileName}</span>
											</p>
										</div>
									)}
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

								{/* Instructions */}
								<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
									<h3 className="text-sm font-medium text-blue-900 mb-2">
										Excel File Format Requirements:
									</h3>
									<ul className="text-xs text-blue-800 space-y-1">
										<li>• First row should contain column headers</li>
										<li>
											• Required columns: Employee ID, Name, Email, Phone,
											Position
										</li>
										<li>
											• Optional columns: Joining Date, Employment Type,
											Department, Location, Manager, Experience Years, Skills,
											Projects
										</li>
										<li>
											• Skills and Projects should be comma-separated values
										</li>
									</ul>
								</div>

								{/* Action Buttons */}
								<div className="flex gap-3">
									<button
										type="button"
										onClick={() => setShowExcelUploadModal(false)}
										disabled={excelUploadLoading}
										className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 disabled:opacity-50"
									>
										Cancel
									</button>
									<button
										onClick={handleExcelUpload}
										disabled={excelUploadLoading || !selectedFile}
										className="flex-1 px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
									>
										{excelUploadLoading ? (
											<>
												<AiOutlineLoading3Quarters
													className="animate-spin"
													size={16}
												/>
												Uploading...
											</>
										) : (
											"Upload Excel"
										)}
									</button>
								</div>
							</div>
						</div>
					</div>,
					document.body
				)}

			{/* Toast Notification */}
			{toast.show &&
				createPortal(
					<div className="fixed top-4 right-4 z-[10000]">
						<div
							className={`px-6 py-4 rounded-lg shadow-lg border-l-4 max-w-sm ${
								toast.type === "error"
									? "bg-red-50 border-red-400 text-red-800"
									: "bg-green-50 border-green-400 text-green-800"
							}`}
						>
							<div className="flex items-center gap-3">
								{toast.type === "error" ? (
									<svg
										className="w-5 h-5 text-red-500 flex-shrink-0"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
											clipRule="evenodd"
										/>
									</svg>
								) : (
									<svg
										className="w-5 h-5 text-green-500 flex-shrink-0"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clipRule="evenodd"
										/>
									</svg>
								)}
								<p className="text-sm font-medium">{toast.message}</p>
								<button
									onClick={() =>
										setToast({ show: false, message: "", type: "" })
									}
									className="ml-auto text-gray-400 hover:text-gray-600"
								>
									<svg
										className="w-4 h-4"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
											clipRule="evenodd"
										/>
									</svg>
								</button>
							</div>
						</div>
					</div>,
					document.body
				)}
		</>
	);
};

export default UserProfile;
