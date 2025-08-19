import React, { useState } from "react";
import { FaEye } from "react-icons/fa";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaEyeSlash } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Register() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [firstName, setFirstname] = useState("");
	const [lastName, setLastname] = useState("");
	const [showpassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigator = useNavigate();

	const handleValidation = () => {
		if (!email) {
			setError("Email is required.");
		} else if (!firstName || !lastName) {
			setError("Name is required.");
		} else if (!password) {
			setError("Password is required.");
		} else {
			setError("");
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await axios.post("http://localhost:8000/api/user/register", {
				email,
				password,
				firstName,
				lastName,
			});

			if (response.data) {
				navigator("/login");
			} else {
				setError(
					response.data?.msg || "Registration failed. Please try again."
				);
			}
		} catch (error) {
			console.log(error.message);
			setError("Registration failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
			<div className="w-full max-w-sm">
				{/* Register Form */}
				<div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
					<div className="mb-4">
						<h2 className="text-xl font-semibold text-gray-900 mb-1">
							Create Account
						</h2>
						<p className="text-gray-600 text-sm">
							Enter your details below to create your account
						</p>
					</div>

					{error && (
						<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-red-600 text-sm">{error}</p>
						</div>
					)}

					<form
						onSubmit={handleSubmit}
						className="space-y-4"
					>
						<div className="grid grid-cols-2 gap-3">
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
									value={firstName}
									onChange={(e) => setFirstname(e.target.value)}
									onBlur={handleValidation}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
									placeholder="First name"
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
									value={lastName}
									onChange={(e) => setLastname(e.target.value)}
									onBlur={handleValidation}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
									placeholder="Last name"
									required
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Email
							</label>
							<input
								type="email"
								id="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								onBlur={handleValidation}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
								placeholder="m@example.com"
								required
							/>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Password
							</label>
							<div className="relative">
								<input
									type={showpassword ? "text" : "password"}
									id="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									onBlur={handleValidation}
									minLength="6"
									className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
									placeholder="At least 6 characters"
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showpassword)}
									className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
								>
									{showpassword ? (
										<FaEyeSlash size={18} />
									) : (
										<FaEye size={18} />
									)}
								</button>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							{loading ? (
								<>
									<AiOutlineLoading3Quarters
										className="animate-spin"
										size={18}
									/>
									Creating account...
								</>
							) : (
								"Create Account"
							)}
						</button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-gray-600 text-sm">
							Already have an account?{" "}
							<Link
								to="/login"
								className="text-blue-600 font-medium hover:underline transition-colors"
							>
								Sign in
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
