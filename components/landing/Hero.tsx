import { Button } from "@/components/ui/button";

export default function Hero() {
    return (
        <div className="min-h-screen flex px-8">

            {/* Left side */}
            <section className="w-1/2 flex flex-col justify-center gap-8 px-16">

                {/* List */}
                <ul className="flex items-center gap-6 list-none text-sm">
                    <li className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full mr-2"></span>
                        PLAN
                    </li>

                    <li className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full mr-2"></span>
                        COLLABORATE
                    </li>

                    <li className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full mr-2"></span>
                        ACHIEVE
                    </li>
                </ul>

                {/* Heading */}
                <h1 className="font-extrabold text-6xl leading-tight">
                    Turn your ideas into
                    <span className="text-[#5c52fc]"> real progress</span>
                </h1>

                {/* Subheading */}
                <p className="text-gray-500 text-lg max-w-xl">
                    Devflow helps you organize projects, track tasks, and
                    collaborate with your team - all in one place.
                </p>

                {/* Buttons */}
                <div className="flex gap-4">
                    <Button>Get Started</Button>
                    <Button variant="outline">Learn More</Button>
                </div>
            </section>

            {/* Right side */}
            <div className="w-1/2 flex items-center justify-center p-16">
                <img
                    src="/v-placeholder.png"
                    alt="Devflow"
                    className="w-full h-full object-contain"
                />
            </div>

        </div>
    );
}