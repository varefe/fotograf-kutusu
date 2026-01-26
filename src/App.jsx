import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import './App.css'

// Lazy loading - sayfalar sadece gerektiğinde yüklenecek
const Home = lazy(() => import('./pages/Home'))
const Order = lazy(() => import('./pages/Order'))
const ProductUpload = lazy(() => import('./pages/ProductUpload'))
const Cart = lazy(() => import('./pages/Cart'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Profile = lazy(() => import('./pages/Profile'))
const OrderTracking = lazy(() => import('./pages/OrderTracking'))
const Admin = lazy(() => import('./pages/Admin'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminPanel = lazy(() => import('./pages/AdminPanel'))
const Payment = lazy(() => import('./pages/Payment'))
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'))
const PaymentFailed = lazy(() => import('./pages/PaymentFailed'))
const PaymentCallback = lazy(() => import('./pages/PaymentCallback'))
const About = lazy(() => import('./pages/About'))
const DeliveryReturns = lazy(() => import('./pages/DeliveryReturns'))
const Privacy = lazy(() => import('./pages/Privacy'))
const DistanceSelling = lazy(() => import('./pages/DistanceSelling'))
const Contact = lazy(() => import('./pages/Contact'))

// Loading fallback component
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '50vh',
    fontSize: '1.2rem',
    color: 'var(--text-color)'
  }}>
    Yükleniyor...
  </div>
)

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/order" element={<Order />} />
                <Route path="/product/:size" element={<ProductUpload />} />
                <Route path="/product" element={<ProductUpload />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/order-tracking" element={<OrderTracking />} />
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
            </Suspense>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
