import React from 'react';
import { Zap, UsersRound, ChartNoAxesColumnIncreasing  } from 'lucide-react';

export default function Homepage() {
  return (
    <>
    <div className='flex flex-col mt-14'>

        <div className='flex flex-col gap-8 px-18'>
            <div className='text-5xl text-center'>Everything you need to do your best work</div>
            
            {/* cards flex container */}
            <div className='flex justify-evenly '>

                <div className='flex flex-col justify-evenly gap-2 py-3 px-6 h-46 w-52 border-2 border-gray-300 rounded-2xl'>
                    <div className='flex justify-start'>
                        <div className='flex justify-center items-center bg-blue-100 rounded-sm size-12'>< Zap /></div>
                    </div>
                    <div className='flex justify-start text-2xl'>Stay Organized</div>
                    <div className='flex justify-start text-gray-400 text-sm'>Keep all your projects and tasks in one place.</div>
                </div>
            
                <div className='flex flex-col justify-evenly gap-2 py-3 px-6 h-46 w-52 border-2 border-gray-300 rounded-2xl'>
                    <div className='flex justify-start'>
                        <div className='flex justify-center items-center bg-blue-100 rounded-sm size-12'>< UsersRound /></div>
                    </div>
                    <div className='flex justify-start text-2xl'>Work Together</div>
                    <div className='flex justify-start text-gray-400 text-sm'>Collaborate with your team seamlessly.</div>
                </div>
            
                <div className='flex flex-col justify-evenly gap-2 py-3 px-6 h-46 w-52 border-2 border-gray-300 rounded-2xl'>
                    <div className='flex justify-start'>
                        <div className='flex justify-center items-center bg-blue-100 rounded-sm size-12'>< ChartNoAxesColumnIncreasing /></div>
                    </div>
                    <div className='flex justify-start text-2xl'>Track Progress</div>
                    <div className='flex justify-start text-gray-400 text-sm'>Visualise your growth with poerful insights.</div>
                </div>
            </div>

        </div>  


        {/* Section2 (blue strip) */}
        <section className='mx-0 bg-blue-200 my-4 px-20 py-5 flex flex-col items-center gap-2 text-center'>
            <div className='text-3xl text-center '>Ready to build something great?</div>
            <div className='text-sm text-center text-gray-500'>Join thousands of creators, students and teams using Devflow</div>
            <button className=" bg-[#5c52fc] p-2 rounded-md px-6 h-3/4 mt-2 text-white items-center w-40 flex justify-center">Get Started</button>
        </section>      
    </div>
    </>
  )
}


