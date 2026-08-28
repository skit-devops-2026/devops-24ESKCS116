import React from 'react'

export default function Header() {

const features = ["Features", "Why Us", "Contact"]

  return (
    // navbar
    <div className="mt-0 mx-0 flex bg-[#fefefe] justify-between border-b-2 font-bold">
        {/* logo */}
        <div className=" py-3 px-12 w-1/3 text-align-left items-center">devflow</div>

        {/* menu */}
        <div className=" flex p-3 gap-16 ">
            {features.map((feature)=>(
                <div>{feature}</div>
            ))}
            <div></div>
        </div>

        {/* login  and get started */}
        <div className='flex px-8 gap-8'>
            <button className=" flex items-center p-2 rounded-md border-2 px-6 border-blue-50 h-3/4 mt-2">Log in</button>
            <button className=" flex bg-[#5c52fc] p-2 rounded-md border-2 px-6 border-blue-50 h-3/4 mt-2 text-white items-center">Get Started</button>
        </div>
        
    </div>
  )
}

