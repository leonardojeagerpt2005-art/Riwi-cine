import { Outlet, Navigate } from "react-router";
import { UseAuth } from "../context/AuthContext";


function PublictRouter() {
    const {isAuthenticated} = UseAuth()
    return isAuthenticated?<Navigate to={"/city"}/>:<Outlet/>
}

export default PublictRouter