import { Link } from "react-router"

function Header (){
    return(
        <header>
            {/* icon */}
            <img src="" alt="" />
            {/* titutlo */}
            <h1 className="text-3xl">titulo</h1>
            {/* boton de logout */}
            <button>logout</button>
            
            <nav className=" flex justify-evenly">
                <Link to="/billboard">billboard</Link>
                <Link to="/membership">membership</Link>
                <Link to="/food">food</Link>
            </nav>
       </header>
    )
}

export default Header

