import { redirect } from "react-router";

export function requirsAuth (){
    const user = localStorage.getItem("user")
    if(!user){
        throw redirect("/")
    }

    return JSON.parse(user)
}