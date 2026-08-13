import {Button} from "@/components/ui/button";

export default function Home(){
  return(
    <>
    <main className="h-screen flex justify-center items-center bg-slate-800">
      <div className="text-red-500 text-5xl shadow-lg">
        Hello devflow.
      </div>
      <Button>
        Get Started
      </Button>
    </main>
    </>
  )
}