import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";
import ChatLayout from "./pages/ChatLayout";
import Chat from "./pages/Chat";
import ChatHome from "./pages/ChatHome";
import Register from "./pages/Register";
import PublicRoute from "./components/PublicRoute";
import PrivateRoute from "./components/PrivateRoute";
import { Landing } from "./pages/Landing";
import Layout from "./pages/Layout";


export default function App() {
	const routes = createBrowserRouter([
		{
			path: "",
			element: <Landing />,
		},
		{
			path: "/chat",
			element: (
				<PrivateRoute>
					<ChatLayout />
				</PrivateRoute>
			),
			children: [
				{
					path: "",
					element: <ChatHome />,
				},
				{
					path: ":chatId",
					element: <Chat />,
				},
			],
		},

		{
			path: "/login",
			element: (
				<PublicRoute>
					<Login />
				</PublicRoute>
			),
		},
		{
			path: "/register",
			element: (
				<PublicRoute>
					{" "}
					<Register />{" "}
				</PublicRoute>
			),
		},
	]);
	return <RouterProvider router={routes} />;
}
