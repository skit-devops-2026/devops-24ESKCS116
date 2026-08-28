import { Button } from "@/components/ui/button";

export default function Hero() {
    return (
        <section className="grid min-h-[calc(100vh-4.5rem)] grid-cols-1 items-center gap-8 px-8 py-12 md:grid-cols-2 md:px-16">
            <div>
                <h1 className="max-w-xl text-5xl font-bold tracking-tight text-slate-950 md:text-7xl">
                    Build Better Products
                </h1>
                <h3 className="mt-6 max-w-lg text-wrap text-lg text-slate-600">
                    Create modern applications faster using our platform.
                </h3>
                <Button className="mt-8">Get Started</Button>
            </div>

            <div className="relative h-64 w-full overflow-hidden rounded-lg md:h-96">
                <img
                    src="/v-placeholder.png"
                    alt="Devflow placeholder"
                    className="absolute inset-0 h-full w-full object-cover"
                />
            </div>
        </section>
    );
}