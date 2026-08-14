import { createBrowserRouter } from "react-router";
import PublictRouter from "./publictRouter/PublictRouter";
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import MainLayout from "./components/layouts/MainLayout";
import BillboardPage from "./pages/BillboardPage";
import MembershipdPage from "./pages/MembershipPage";
import FoodPage from "./pages/FoodPage";

export const router = createBrowserRouter(
    [
        {
            path:"/",
            element:<PublictRouter/>,
            children:[
                {
                    index:true,
                    element:<LoginPage/>
                },
                {
                    path:"register",
                    element:<RegisterPage/>
                }
            ]
        },
        {
            element:<MainLayout/>,
            children:[
                {
                    path:"/billboard",
                    element:<BillboardPage/>
                },
                {
                    path:"membership",
                    element:<MembershipdPage/>
                },
                {
                    path:"food",
                    element:<FoodPage/>
                }
            ]
        }   
    ]
)