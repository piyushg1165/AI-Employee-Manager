import React, { useContext, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { Context } from "../Context/Main";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Login() {
	const { setUserData, setUserMessages } = useContext(Context);
	const [, setSearchParams] = useSearchParams();
	const [loading, setLoading] = useState(false);
	const navigator = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showpassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!email || !password) {
			setError("Please enter both email and password.");
			return;
		}

		setLoading(true);
		setError("");

		try {
			const response = await axios.post(
				`http://localhost:8000/api/user/login`,
				{ email, password },
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);

			if (response.data) {
				try {
					const userResponse = await axios.get(`http://localhost:8000/api/user`, {
						withCredentials: true,
					});

					if (userResponse.data) {
						localStorage.setItem("user", JSON.stringify(userResponse.data));
						setUserData(userResponse.data);
						setUserMessages([]);
						setSearchParams("");
						navigator("/chat");
					}
				} catch (err) {
					console.error("Error fetching user data:", err);
					setError("Failed to fetch user data. Please try again.");
				}
			} else {
				setError("Login failed. Please check your credentials.");
			}
		} catch (error) {
			console.error("Login error:", error);
			setError("Login failed. Please check your email and password.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
			<div className="w-full max-w-sm">
				{/* Login Form */}
				<div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
					<div className="mb-4">
						<h2 className="text-xl font-semibold text-gray-900 mb-1">
							Login to your account
						</h2>
						<p className="text-gray-600 text-sm">
							Enter your email below to login to your account
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
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
								placeholder="m@example.com"
								required
							/>
						</div>

						<div>
							<div className="flex items-center justify-between mb-1">
								<label
									htmlFor="password"
									className="block text-sm font-medium text-gray-700"
								>
									Password
								</label>
								<button
									type="button"
									className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
								>
									Forgot your password?
								</button>
							</div>
							<div className="relative">
								<input
									type={showpassword ? "text" : "password"}
									id="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
									placeholder="Enter your password"
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
									Logging in...
								</>
							) : (
								"Login"
							)}
						</button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-gray-600 text-sm">
							Don't have an account?{" "}
							<button
								onClick={() => navigator("/register")}
								className="text-blue-600 font-medium hover:underline transition-colors"
							>
								Sign up
							</button>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
