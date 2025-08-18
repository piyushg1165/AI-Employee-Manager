import React from "react";
import { Navigate } from "react-router-dom";


const PrivateRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("user")) || null;

    if (!user || !user?._id) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default PrivateRoute;
