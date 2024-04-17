import React from "react";
import { IoIosSearch } from "react-icons/io";
import { CiCalendarDate, CiTempHigh} from "react-icons/ci";
import { WiHumidity, WiStrongWind } from "react-icons/wi";
import { BsSunFill,BsCloudsFill,BsCloudLightningRainFill,BsCloudRainFill,BsCloudFog2Fill } from "react-icons/bs";
import { TbLoader } from "react-icons/tb";
import { MdOutlineHistory } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import { FaLocationArrow } from "react-icons/fa6";
import axios from "axios";


interface DataProps{
    name:string,
    main:{
        temp:number,
        humidity:number,
        feels_like: number,
    },
    sys:{
        country:string,
    },
    wind:{
        speed:number,

    },
    dt:number,
    weather:{
        main:string,
        description:string,
    }[]

}

export const Weather :React.FC = () => {
    const apiKey = '54a57bc234ad752a4f59e59cd372201d';
    const api_EndPoint = 'https://api.openweathermap.org/data/2.5/'

     const [weatherInfo, setweatherInfo] = React.useState<DataProps | null>(null)
     const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
     const [isLoading, setisLoading] = React.useState(false);
     const [SearchLocation, setSearchLocation] = React.useState('')
     const [isCelsius, setIsCelsius] = React.useState(true);

     const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
     const maxRecentSearches = 5;

    const updateRecentSearches = (searchTerm: string) => {
    if (recentSearches.includes(searchTerm)) {
      return;
    }
    const updatedSearches = [searchTerm, ...recentSearches.filter(search => search !== searchTerm)];
    setRecentSearches(updatedSearches.slice(0, maxRecentSearches));
  };
  const [showRecentSearches, setShowRecentSearches] = React.useState(false);

  const handleRecentSearchClick = (searchTerm: string) => {
    setSearchLocation(searchTerm);
    handleSearch();
  };

  const handleHistoryIconClick = () => {
    if (recentSearches.length === 0) {
      setErrorMessage('No search history.');
    } else {
      setShowRecentSearches(!showRecentSearches);
    }
  };

     
  const handleConvert = () => {
      setIsCelsius(!isCelsius);
  };
  

    const GetData = async(lat:number, lon:number)=>{
       const url = `${api_EndPoint}weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
       const res = await axios.get(url);
       return res.data
    }

    const fetchData = async(city:string)=>{
        try{
        const url =`${api_EndPoint}weather?q=${city}&appid=${apiKey}&units=metric`;
        const dataResponse = await axios.get(url)

        const searchWeather:DataProps= dataResponse.data;
        return{searchWeather}

    }catch(error){
        console.error('no data');
        throw error

    }}

    const handleSearch = async ()=>{
        if(SearchLocation.trim()===""){
          setErrorMessage('Please input a location.');
            return;
        }try{
            const {searchWeather} = await fetchData(SearchLocation);
            setweatherInfo(searchWeather);
            setErrorMessage(null);
            updateRecentSearches(SearchLocation);
        }catch(error){
            console.log('no results');
            setweatherInfo(null); // Reset weatherInfo to clear previous data
            setErrorMessage('Location not found. Please enter a valid location.');
        }
    }
    //  CONVERT API DT TO DATE AND TIME
     const convertUnixToDate = (unixTimestamp: number) => {
        const date = new Date(unixTimestamp * 1000);
        return date.toLocaleString();
      };

      // CHANGE ICON BASED ON API CALL
    const ChangeIcon = (weather:string)=>{
      let Icon: React.ReactNode;
      let IconColor : string;
      
      switch (weather) {
        case "Rain":
        Icon = <BsCloudRainFill/>
        IconColor="#1BA9A2"
        break;

        case "Clear":
        Icon = <BsSunFill/>
        IconColor="#F5AF00"
        break;

        case "Clouds":
        Icon = <BsCloudsFill/>
        IconColor="#f17105"
        break;

        case "Mist":
        Icon = <BsCloudFog2Fill/>
        IconColor="#279eff"
        break;

        case "Thunderstorm":
        Icon = <BsCloudLightningRainFill/>
        IconColor="#279eff"
        break;
      
        default:
            Icon = <BsSunFill/>
            IconColor="#dc4d00"
            break;
      }
      return(
        <span className="Icon" 
        style={{color:IconColor}} >{Icon}</span>
      )
    }  

    React.useEffect(()=>{
        navigator.geolocation.getCurrentPosition((position)=>{
            const {latitude,longitude} = position.coords;
            Promise.all([GetData(latitude,longitude)]).then(([currentWeather])=>{
              setweatherInfo(currentWeather)
  
              setisLoading(true);
          });
        })},
    
        [])
  return (

    <>
   <body>

    <div className="container">
        <div className="display-search">
          <div className="search-bar flex">
            <input 
            type="text" 
            value={SearchLocation}
            onChange={(e)=>setSearchLocation(e.target.value)}
            placeholder="Search Location"/>
            <IoIosSearch className="search-icon" 
            onClick={handleSearch}/>

            <MdOutlineHistory 
            onClick={handleHistoryIconClick} 
            className="icon"
             />

          </div>
          {errorMessage && (
           <div className="error-message">{errorMessage}</div>
          )}
      {showRecentSearches && recentSearches.length > 0 && (
        <div className="recent-searches flex">
          <h3>Recent Searches:</h3>
            {recentSearches.map((searchTerm, index) => (
              <div className="history-results flex">
              <FaLocationArrow className="icon"/>
              <span key={index} onClick={()=>handleRecentSearchClick(searchTerm)}>{searchTerm}</span>
              </div>
    
            ))}
        </div>
      )}
        </div>

          {weatherInfo &&  isLoading ? (
            <>
                      
    <div className="displayWeather display-search">
        <div className="displayWeatherContent flex">
        < div className="main-icon">
            {ChangeIcon(weatherInfo.weather[0].main)}
        </div>
          <div>
            <h1>  {isCelsius ? weatherInfo.main.temp.toFixed(1) : (((weatherInfo.main.temp) * (9/5)) + 32 ).toFixed(1)} {isCelsius ? "°C" : "k"}
            <IoIosArrowDown 
            onClick={handleConvert}
            style={{color:'#dc4d00'}}/>
            </h1>
            <h2>{weatherInfo.weather[0].main}</h2>
            <p>{weatherInfo.weather[0].description}</p>
         </div>
        </div>
        <div className="weatherDetails">
        <h1>{weatherInfo.name}</h1>
        <p>{weatherInfo.sys.country}</p>
        </div>
       
       </div>
       
       <div className="sections">
        <div className="weatherInfo">
        <div className="icons flex">
        <CiCalendarDate className="icon" />
            <h2>date</h2>
        </div>
        <p>{convertUnixToDate(weatherInfo.dt)}</p>
        </div>
        <div className="weatherInfo">
        <div className="icons flex">
           <CiTempHigh className="icon" />
            <h2>feels like</h2>
        </div>
        <p>{weatherInfo.main.feels_like}°C</p>
        </div>
        <div className="weatherInfo">
        <div className="icons flex">
            <WiHumidity className="icon" />
            <h2>humidity</h2>
        </div>
        <p>{weatherInfo.main.humidity}%</p>
        </div>
        <div className="weatherInfo">
        <div className="icons flex">
            <WiStrongWind className="icon" />
            <h2>wind speed</h2>
        </div>
        <p>{weatherInfo.wind.speed}m/s</p>
        </div>
       </div>
            </>
          ):(
          <div className="loading-segment flex">
            <TbLoader className="loader"/>
            <h2>Getting Weather Reports...</h2>
          </div>
          )}
  
         
      
    </div>
   </body>
    </>
  )
}

