import React, { useContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Context } from "../Context/Main";
import SideBar from "../components/SideBar";

export default function ChatLayout() {
	const { userData, setUserData } = useContext(Context);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	useEffect(() => {
		if (!userData || userData == null) {
			window.location.href = "/login";
		} else {
			setUserData(userData);
		}
	}, []);

	// Set sidebar open by default on desktop
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 768) {
				setIsSidebarOpen(true);
			} else {
				setIsSidebarOpen(false);
			}
		};

		// Set initial state
		handleResize();

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<div className="flex h-screen overflow-hidden">
			<SideBar
				isOpen={isSidebarOpen}
				setIsOpen={setIsSidebarOpen}
			/>
			<main
				className={`flex-1 bg-white transition-all duration-300 overflow-auto ${
					isSidebarOpen ? "md:ml-0" : "md:ml-0"
				}`}
			>
				<Outlet />
			</main>
		</div>
	);
}
