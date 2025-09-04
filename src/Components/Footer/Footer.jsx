function Footer() {
    return (
        <div className=" bottom-0 w-full">




            <div className="border border-black  p-14 items-center justify-center bg-slate-900  grid sm:grid-cols-4">





                <div className="py-4 text-white   pl-12 ">
                    <h3 className="">Coliba!
                    </h3>Lorem ipsum dolor <br /> sit amet consectetur <br />adipisicing elit.
                    <div className="  flex flex-col sm:flex-row m-2 items-center">
                        <i className="fa-brands fa-facebook scale-150  pt-3 hover:scale-[2] duration-300"></i>
                        <i className="fa-brands fa-twitter scale-150 ml-4 pt-3 hover:scale-[2] duration-300"></i>
                        <i className="fa-brands fa-linkedin scale-150 ml-4 pt-3 hover:scale-[2] duration-300"></i>
                        <i className="fa-brands fa-instagram scale-150 ml-4 pt-3 hover:scale-[2] duration-300"></i>
                    </div>




                </div>
                <div className="py-4 text-white  pl-12 "> <h6>Quick Links:</h6>
                    <a className="hover:text-stone-300" href="About">About</a> <br />
                    <a className="hover:text-stone-300" href="Team">Team</a> <br />
                    <a className="hover:text-stone-300" href="Products">Products</a> <br />
                    <a className="hover:text-stone-300" href="Signin">SignIn</a> <br />
                </div>




                <div className="py-4 text-white   pl-12">
                    <h6 className=" ">Overview!</h6>
                    <a className="hover:text-stone-300" href="a">Themes</a> <br />
                    <a className="hover:text-stone-300" href="a">Pricing</a> <br />
                    <a className="hover:text-stone-300" href="a">Services</a> <br />
                    <a className="hover:text-stone-300" href="a">Contact us</a> <br />
                </div>






                <div className="py-4 text-white  pl-12">

                    <div>Have a Question?</div>

                    <div><i className="fa-solid fa-location-dot"></i> 203 Fake st, <br /> Mountain View</div>

                    <div><i className="fa-solid fa-phone mr-2"></i>+800-05599</div>

                    <div><i className="fa-regular fa-paper-plane-top"></i>info@you.com</div>


                </div>

            </div>










            <div className="flex items-center justify-center py-4 text-center  bg-zinc-300 border-t-4 border-lime-700 ">
                <h3>Powered by  IT Department - The #1 Open Source eCommerce</h3>
            </div>



        </div>
    )
}

export default Footer