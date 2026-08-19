import { createBrowserRouter } from "react-router";
import PublictRouter from "./publictRouter/PublictRouter";
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import MainLayout from "./components/layouts/MainLayout";
import BillboardPage from "./pages/BillboardPage";
import MembershipdPage from "./pages/MembershipPage";
import FoodPage from "./pages/FoodPage";
import { requirsAuth} from "./loaders/authLoader"
import CityPage from "./pages/CityPage";
import { requirsCity } from "./loaders/dashboardLoader";
import CityRouter from "./cityRouter/CityRoute";

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
            path:"city",
            loader:requirsAuth,
            element:<CityRouter/>,
            children:[
                {
                    index:true,
                    element:<CityPage/>
                }
            ]
        },
        {
            element:<MainLayout/>,
            loader:requirsCity,
            children:[
                {
                    path:"billboard",
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