import { auth } from "@/auth"
import { redirect } from "next/navigation"
import LandingPage from "@/components/LandingPage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Þvottahúsbókunarkerfi — Smart laundry for modern buildings",
  description: "Skipuleggðu þvottinn þinn. Smart laundry room booking — easy for residents, powerful for managers.",
}

export default async function Home() {
  const session = await auth()
  if (session) redirect("/rooms")
  return <LandingPage />
}
