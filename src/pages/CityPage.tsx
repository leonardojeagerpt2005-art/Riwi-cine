import { useNavigate } from "react-router"
import { UseAuth } from "../context/AuthContext"
import { useState } from "react"
import type { UserCity } from "../types/user";

function CityPage (){
const navigate = useNavigate()
const {location, backLogin} = UseAuth()
const [country, setCountry] = useState("")
const [city, setCity] = useState("")


function handleCountryChange(event: React.ChangeEvent<HTMLInputElement>){
    setCountry(event.target.value)
}

function handleCityChange(event: React.ChangeEvent<HTMLInputElement>){
    setCity(event.target.value)
}

function handleSubimitedCity (event: React.SubmitEvent<HTMLFormElement>){
    event.preventDefault()

    const userCity:UserCity = {
        country: country,
        city: city
    }

    location(userCity)
    navigate("/billboard")
}

function back (){
    backLogin()
    navigate("/")
}

    return(
        <>
        <h1>City Page</h1>
        <button onClick={back}>back to login</button>
        <form onSubmit={handleSubimitedCity} >
            <input onChange={handleCountryChange} type="text" name="country" placeholder="enter no se" required/>
            <input onChange={handleCityChange} type="text" name="city" placeholder="enter no se" required/>
            <button>go to billboard</button>
        </form>
       
        </>
)
}

export default CityPage