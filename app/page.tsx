import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Homepage from "@/components/landing/Homepage";
import Footer from "@/components/landing/Footer";

export default function Home(){
  return(
    <>
    <main className="h-screen flex flex-col bg-[#fefefe]">
      <Header />
      <Hero />
      <Homepage />
      <Footer />
      
    </main>
    </>
  )
}