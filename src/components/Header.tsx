import { Link, useNavigate } from "react-router"
import { UseAuth } from "../context/AuthContext"
function Header (){
    const {logout} = UseAuth()
    const navigate = useNavigate()
    function handleLogout(){
        logout()
        navigate("/")
    }
    return(
        <header>
            {/* icon */}
            {/* <img src="" alt="" /> */}
            {/* titutlo */}
            <div className="flex justify-around">

            <h1 className="text-3xl">titulo</h1>
            {/* boton de logout */}
            <button onClick={handleLogout} >logout</button>
            </div>
            
            <nav className=" flex justify-evenly">
                <Link to="/billboard">billboard</Link>
                <Link to="/membership">membership</Link>
                <Link to="/food">food</Link>
            </nav>
       </header>
    )
}

export default Header

