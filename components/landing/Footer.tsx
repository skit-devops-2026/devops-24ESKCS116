import { Heart, Mail } from 'lucide-react';


export default function Footer(){
    return(
        <>
            <div className="flex justify-evenly mt-0 py-2">

                <div className='flex flex-col gap-2'>
                    <div className='font-bold'>Devflow</div>
                    <div className='text-sm text-gray-500'>Plan today, build tomorrow.</div>
                </div>

                <div className='flex flex-col gap-1'>
                    <div className='font-bold text-sm text-left'>Product</div>
                    <ul className='list-none'>
                        <li className='text-sm'>Features</li>
                        <li className='text-sm'>Pricing</li>
                        <li className='text-sm'>FAQ</li>
                    </ul>
                </div>

                <div className='flex flex-col gap-1'>
                    <div className='font-bold text-sm text-left'>Company</div>
                    <ul className='list-none'>
                        <li className='text-sm'>About</li>
                        <li className='text-sm'>Blog</li>
                        <li className='text-sm'>Careers</li>
                    </ul>
                </div>

                {/* Stay connected */}
                <div className='flex flex-col gap-2'>
                    <div className='text-2xl font-bold'>Stay Connected</div>
                    <div className='flex gap-2'>
                        <Mail />
                        <Mail />
                        <Mail />
                    </div>
                </div>
            </div>

            <div className="text-gray-500 bg-gray-100 flex justify-between items-center px-8 py-4 whitespace-nowrap">
                <div>© 2026 Devflow. All rights reserved.</div>

                <div className="flex items-center gap-1">
                    Made with
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    for builders
                </div>
            </div>
        </>
    )
}