import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Order from './pages/Order'
import ProductUpload from './pages/ProductUpload'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import AdminPanel from './pages/AdminPanel'
import Payment from './pages/Payment'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFailed from './pages/PaymentFailed'
import PaymentCallback from './pages/PaymentCallback'
import About from './pages/About'
import DeliveryReturns from './pages/DeliveryReturns'
import Privacy from './pages/Privacy'
import DistanceSelling from './pages/DistanceSelling'
import Contact from './pages/Contact'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/order" element={<Order />} />
              <Route path="/product/:size" element={<ProductUpload />} />
              <Route path="/product" element={<ProductUpload />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin-panel" element={<AdminPanel />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/failed" element={<PaymentFailed />} />
              <Route path="/api/payment/callback" element={<PaymentCallback />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/delivery-returns" element={<DeliveryReturns />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/distance-selling" element={<DistanceSelling />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
