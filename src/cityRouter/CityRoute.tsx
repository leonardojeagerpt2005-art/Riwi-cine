import { Outlet, Navigate } from "react-router";
import { UseAuth } from "../context/AuthContext";


function CityRouter() {
    const {haveCity} = UseAuth()
    return haveCity?<Navigate to={"/billboard"}/>:<Outlet/>
    
}

export default CityRouter