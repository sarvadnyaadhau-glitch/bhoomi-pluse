import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { FarmProvider } from '@/context/FarmContext'
import { LoadingScreen } from '@/components/ui'
import AuthScreen from '@/screens/AuthScreen'
import AppLayout from '@/screens/AppLayout'
import HomeScreen from '@/screens/HomeScreen'
import MyFarmScreen from '@/screens/MyFarmScreen'
import ScanScreen from '@/screens/ScanScreen'
import AskScreen from '@/screens/AskScreen'
import MarketScreen from '@/screens/MarketScreen'
import NewsScreen from '@/screens/NewsScreen'
import MoreScreen from '@/screens/MoreScreen'

export default function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return <LoadingScreen label="SENSOTECH" />
  }

  if (!session) {
    return <AuthScreen />
  }

  return (
    <Routes>
      <Route path="/" element={<FarmProvider><AppLayout /></FarmProvider>}>
        <Route index element={<HomeScreen />} />
        <Route path="farm" element={<MyFarmScreen />} />
        <Route path="scan" element={<ScanScreen />} />
        <Route path="ask" element={<AskScreen />} />
        <Route path="market" element={<MarketScreen />} />
        <Route path="news" element={<NewsScreen />} />
        <Route path="more" element={<MoreScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
