import { redirect } from "react-router";

export function requirsCity (){
    const user = localStorage.getItem("user")
    const userCity = localStorage.getItem("user city")
    if(!user){
        throw redirect("/")
    }

    if(!userCity){
        throw redirect("/city")
    }

    return JSON.parse(user)
}