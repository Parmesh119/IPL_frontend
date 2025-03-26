import { createFileRoute } from '@tanstack/react-router'
import Navbar from '@/components/landing-pages/navbar'
import LandingPage from '@/components/landing-pages/Hero'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="min-h-screen bg-purple-50 text-gray-800">
      <Navbar />
      <main className="container mx-auto px-4 space-y-24 py-12">
        <LandingPage />
      </main>
    </div>
  )
}