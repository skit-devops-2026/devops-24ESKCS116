import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";

export default function Home(){
  return(
    <>
    <main className="h-screen flex flex-col bg-[#fefefe]">
      <Header />
      <Hero />
    </main>
    </>
  )
}