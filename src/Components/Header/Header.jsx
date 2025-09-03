function Header(){
    return(
             <>

             <div className=" flex flex-col items-center justify-center hover:scale-105 duration-500 bg-transparent ">

        <div className=" flex flex-col  w-[80%] mt-4 p-2">


            <div className=" flex justify-between">
                <div className=" h-24 w-64 flex flex-col sm:flex-row items-center justify-around ">
                    
                
            <div className="text-zinc-400 "> 
                 <i className="fa-brands fa-facebook scale-150 text-zinc-600 hover:scale-[2] duration-300 pt-2"></i></div>
               <i className="fa-brands fa-twitter scale-150 text-zinc-600 hover:scale-[2] duration-300 pt-2"></i>             
                <i className="fa-brands fa-linkedin scale-150 text-zinc-600 hover:scale-[2] duration-300 pt-2"></i>
                <i className="fa-brands fa-instagram scale-150 text-zinc-600 hover:scale-[2] duration-300 pt-2"></i>
                </div>
                


                <div className=" h-24 w-64 flex items-center justify-center  shadow-sm mb-3 shadow-indigo-300 hover:border-4 border-amber-500 duration-200  "><img src="images/Header/utility_store.jpg" alt="" /></div>
                <div className="hidden sm:block h-24 w-66 flex items-center justify-center ml-4 pt-8"> <i className="fa-solid fa-phone mr-2"></i> For Complains: 0800-05599</div>
            </div>



           <div className="border border-zinc-300 rounded-s-3xl rounded-r-3xl"> <div className="flex  rounded-s-3xl rounded-r-3xl hover:border border-blue-200 duration-300">
                <input className="w-[91.5%] h-10 rounded-s-3xl p-4 " type="text" placeholder="Search Here..." />
                <button className=" h-10 w-[8.5%] bg-blue-500 text-white rounded-r-3xl hover:bg-blue-400"><i className="fa-solid fa-magnifying-glass"></i></button>
            </div> </div>




                       
            <div className=" my-4 flex items-center justify-center ">
                    <div className="grid grid-cols-2 sm:grid-cols-4 ">
                <a className="flex items-center justify-center m-2 p-3 sm:mr-4 sm:ml-2 bg-amber-500 font-semibold rounded-md hover:bg-yellow-300 duration-300 hover:scale-105" href="/UtilityStore">About</a>
                <a className="flex items-center justify-center m-2 p-3 sm:mr-4 bg-amber-500 font-semibold rounded-md hover:bg-yellow-300 duration-300 hover:scale-105 " href="/Team">Team</a>
                <a className="flex items-center justify-center m-2 p-3 sm:mr-4 bg-amber-500 font-semibold rounded-md hover:bg-yellow-300 duration-300 hover:scale-105" href="/Products">Products</a>
                <a className="flex items-center justify-center m-2 p-3 sm:mr-4 bg-amber-500 font-semibold rounded-md hover:bg-yellow-300 duration-300 hover:scale-105" href="/login">Sign in</a>
            </div></div>


           
 

            
        
          

        </div>
        </div>

        </>
    )
}

export default Header