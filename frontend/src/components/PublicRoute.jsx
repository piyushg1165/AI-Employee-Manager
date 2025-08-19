import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
	const user = JSON.parse(localStorage.getItem("user")) || null;

	if (user && user?._id) {
		return (
			<Navigate
				to="/chat"
				replace
			/>
		);
	}

	return <>{children}</>;
};

export default PublicRoute;
