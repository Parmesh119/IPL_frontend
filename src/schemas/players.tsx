export type Player = {
  name: string
  country: string
  age: number
  role: string
  battingStyle: string
  bowlingStyle: string
  teamId: string
  basePrice: string
  sellPrice?: string |  null
  status: "Pending" | "Sold" | "Unsold"
}