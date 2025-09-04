function Team(){
    return(
        
        <div>
            
              
              <div className="flex items-center justify-center text-center my-4">
            <div className="font-medium  text-[100px]    border-4 rounded-xl border-amber-500  flex flex-col justify-center items-center text-shadow-blue"> 
            <p className="px-8 py-4 ">WE ARE <br /> OFFERING</p>
            </div></div> 




            <div className=" ">
                <div className="  grid grid-cols-2 sm:grid-cols-4  ml-8 pl-8 mb-8 mt-4 ">
                    <div className=" "> <img className="hover:animate-tilt-shaking h-64 hover:border-8 border-lime-50 duration-300 hover:shadow-lg hover:shadow-indigo-300" src="images/Offering/snacks_&_spices.jpg" alt="" /></div>
                    <div className=" "><img className="hover:animate-tilt-shaking h-64 hover:border-8 border-lime-50 duration-300 hover:shadow-lg hover:shadow-indigo-300" src="images/Offering/rice_&_pulses.jpg" alt="" /></div>
                    <div className=" "><img className="hover:animate-tilt-shaking h-64 hover:border-8 border-lime-50 duration-300 hover:shadow-lg hover:shadow-indigo-300" src="images/Offering/home_cleaning.jpg" alt="" /></div>    
                    <div className=" "><img className="hover:animate-tilt-shaking h-64 hover:border-8 border-lime-50 duration-300 hover:shadow-lg hover:shadow-indigo-300" src="images/Offering/personal_hygiene.jpg" alt="" /></div>     
                </div>
             </div>


          
        
        </div>
    )
}

export default Team