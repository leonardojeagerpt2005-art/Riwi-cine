import { createContext, useContext, useState } from "react";

import type { User } from "../types/user";

type AuthContext ={
    user:User|null,
    isAuthenticated: boolean,
    login:(user:User)=> void,
    logout:()=>void
}

export const AuthContext = createContext<AuthContext|null>(null) 

function AuthProvider ({children}:{children: React.ReactNode}){
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(()=>{return localStorage.getItem("isAuthenticated")==="true"})
    const [user, setUser] = useState<User|null>(null)

    function login(user:User){
        setUser(user)
        setIsAuthenticated(true)
        localStorage.setItem("user", JSON.stringify( {id: user.id,name: user.name}) )
        localStorage.setItem("isAuthenticated", "true")
    }

    function logout(){
        setIsAuthenticated(false)
        setUser(null)
        localStorage.removeItem("user")
        localStorage.removeItem("isAuthenticated")
    }

    return(<AuthContext.Provider value={{user, isAuthenticated, login, logout}}> {children} </AuthContext.Provider>)


}

export function UseAuth(){
    const context = useContext(AuthContext)
    if(!context){
        throw new Error("user context inside authProvider")
    }

    return context
}

export default AuthProvider