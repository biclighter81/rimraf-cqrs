import MyListComponent from "./myListComonent";


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Hallo Welt</h1>
      <div className=" grid grid-cols-2 gap-4">
        <MyListComponent/>
      </div>
    </main>
  )
}
