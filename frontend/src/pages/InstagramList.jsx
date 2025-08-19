import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useContext } from "react";
import { Context } from "../Context/Main";

export function InstagramList() {
	const navigator = useNavigate();
	const { userData } = useContext(Context);
	const isUserExits = userData ? true : false;

	// Sample Instagram posts data
	const instagramPosts = [
		{
			id: 1,
			username: "travel_lover",
			userAvatar:
				"https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face",
			image:
				"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
			caption: "Amazing sunset at the beach! 🌅 #travel #sunset #beach",
			likes: 1247,
			comments: 89,
			timestamp: "2 hours ago",
		},
		{
			id: 2,
			username: "foodie_chef",
			userAvatar:
				"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
			image:
				"https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop",
			caption:
				"Homemade pasta with fresh basil and cherry tomatoes 🍝 #food #cooking #pasta",
			likes: 892,
			comments: 45,
			timestamp: "4 hours ago",
		},
		{
			id: 3,
			username: "fitness_motivation",
			userAvatar:
				"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
			image:
				"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
			caption:
				"Morning workout complete! 💪 Ready to conquer the day #fitness #motivation #workout",
			likes: 2156,
			comments: 123,
			timestamp: "6 hours ago",
		},
		{
			id: 4,
			username: "art_creator",
			userAvatar:
				"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
			image:
				"https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop",
			caption:
				"New painting inspired by urban landscapes 🎨 #art #painting #urban",
			likes: 567,
			comments: 34,
			timestamp: "1 day ago",
		},
		{
			id: 5,
			username: "tech_geek",
			userAvatar:
				"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face",
			image:
				"https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop",
			caption:
				"Latest tech setup for productivity! 💻 #tech #productivity #setup",
			likes: 1342,
			comments: 67,
			timestamp: "1 day ago",
		},
	];

	return (
		<div className="relative mx-auto my-5 flex flex-col items-center justify-center">
			<Navbar />
			<div className="px-4 py-10 md:py-20 w-full max-w-2xl">
				<motion.h1
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="relative z-10 mx-auto text-center text-3xl font-bold text-slate-700 md:text-4xl mb-8"
				>
					Instagram Feed
				</motion.h1>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="space-y-6"
				>
					{instagramPosts.map((post, index) => (
						<motion.div
							key={post.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
							className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
						>
							{/* Post Header */}
							<div className="flex items-center p-4 border-b border-gray-200">
								<img
									src={post.userAvatar}
									alt={post.username}
									className="w-10 h-10 rounded-full object-cover"
								/>
								<div className="ml-3">
									<p className="font-semibold text-gray-900">{post.username}</p>
									<p className="text-sm text-gray-500">{post.timestamp}</p>
								</div>
							</div>

							{/* Post Image */}
							<div className="relative">
								<img
									src={post.image}
									alt="Post"
									className="w-full h-64 object-cover"
								/>
							</div>

							{/* Post Actions */}
							<div className="p-4">
								<div className="flex items-center space-x-4 mb-3">
									<button className="text-2xl hover:text-red-500 transition-colors">
										❤️
									</button>
									<button className="text-2xl hover:text-gray-600 transition-colors">
										💬
									</button>
									<button className="text-2xl hover:text-gray-600 transition-colors">
										📤
									</button>
								</div>

								{/* Likes */}
								<p className="font-semibold text-gray-900 mb-2">
									{post.likes.toLocaleString()} likes
								</p>

								{/* Caption */}
								<p className="text-gray-900 mb-2">
									<span className="font-semibold">{post.username}</span>{" "}
									{post.caption}
								</p>

								{/* Comments */}
								<p className="text-gray-500 text-sm">
									View all {post.comments} comments
								</p>
							</div>
						</motion.div>
					))}
				</motion.div>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3, delay: 1 }}
					className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
				>
					{isUserExits ? (
						<button
							onClick={() => navigator("/chat")}
							className="w-60 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800"
						>
							Back to Dashboard
						</button>
					) : (
						<button
							onClick={() => navigator("/login")}
							className="w-60 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800"
						>
							Login
						</button>
					)}
				</motion.div>
			</div>
		</div>
	);
}

const Navbar = () => {
	return (
		<nav className="flex w-full items-center justify-between px-4 py-4">
			<div className="flex items-center gap-2">
				<div className="size-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500" />
				<h1 className="text-base font-bold md:text-2xl">Instagram Feed</h1>
			</div>
		</nav>
	);
};
