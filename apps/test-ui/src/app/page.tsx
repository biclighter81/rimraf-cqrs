import Link from "next/link";
import MyListComponent from "./myListComonent";


export default function Home() {
  return (
    <>
      
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className=" grid grid-cols-2 gap-4">
          <MyListComponent />
        </div>
      </main>
    </>
  )
}
