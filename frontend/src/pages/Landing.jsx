import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
 
import { useContext } from "react";
import { Context } from "../Context/Main";

export function Landing() {
	const navigator = useNavigate();
	const { userData } = useContext(Context);
	const isUserExits = userData ? true : false;

	return (
		<div className="relative mx-auto my-5 flex flex-col items-center justify-center">
			<Navbar />
			<div className="px-4 py-10 md:py-20">
				<h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-slate-700 md:text-4xl lg:text-7xl light:text-slate-300">
					{"Build AI Models with Intelligence and Precision"
						.split(" ")
						.map((word, index) => (
							<motion.span
								key={index}
								initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
								animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
								transition={{
									duration: 0.3,
									delay: index * 0.1,
									ease: "easeInOut",
								}}
								className="mr-2 inline-block"
							>
								{word}
							</motion.span>
						))}
				</h1>
				<motion.p
					initial={{
						opacity: 0,
					}}
					animate={{
						opacity: 1,
					}}
					transition={{
						duration: 0.3,
						delay: 0.8,
					}}
					className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-neutral-600 light:text-neutral-400"
				>
					Create, train, and deploy AI models with our advanced platform. Get
					intelligent outputs based on your company data and requirements.
					Experience the future of AI.
				</motion.p>
				<motion.div
					initial={{
						opacity: 0,
					}}
					animate={{
						opacity: 1,
					}}
					transition={{
						duration: 0.3,
						delay: 1,
					}}
					className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
				>
					{/* <button
                        className="w-24 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 md:w-32 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                        Login
                    </button> */}

					{isUserExits ? (
						<button
							onClick={() => navigator("/chat")}
							className="w-60 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 light:bg-white light:text-black light:hover:bg-gray-200"
						>
							Dashboard
						</button>
					) : (
						<button
							onClick={() => navigator("/login")}
							className="w-60 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
						>
							Login
						</button>
					)}

					{/* <button
                        className="w-60 transform rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-100 dark:border-gray-700 dark:bg-black dark:text-white dark:hover:bg-gray-900">
                        Contact Support
                    </button> */}
				</motion.div>
			</div>
		</div>
	);
}

const Navbar = () => {
	return (
		<nav className="flex w-full items-center justify-between px-4 py-4 dark:border-neutral-800">
			<div className="flex items-center gap-2">
				<div className="size-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500" />
				<h1 className="text-base font-bold md:text-2xl">Virox AI</h1>
			</div>
		</nav>
	);
};
