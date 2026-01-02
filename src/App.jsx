import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Order from './pages/Order'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import Payment from './pages/Payment'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFailed from './pages/PaymentFailed'
import About from './pages/About'
import DeliveryReturns from './pages/DeliveryReturns'
import Privacy from './pages/Privacy'
import DistanceSelling from './pages/DistanceSelling'
import Contact from './pages/Contact'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/order" element={<Order />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failed" element={<PaymentFailed />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/delivery-returns" element={<DeliveryReturns />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/distance-selling" element={<DistanceSelling />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
