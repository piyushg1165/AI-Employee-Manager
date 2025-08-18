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

						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-300" />
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-white text-gray-500">
									Or continue with
								</span>
							</div>
						</div>

						<button
							type="button"
							className="w-full bg-white text-gray-900 py-2 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-3"
						>
							<svg
								className="w-4 h-4"
								viewBox="0 0 24 24"
							>
								<path
									fill="currentColor"
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								/>
								<path
									fill="currentColor"
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								/>
								<path
									fill="currentColor"
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								/>
								<path
									fill="currentColor"
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								/>
							</svg>
							Login with Google
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
