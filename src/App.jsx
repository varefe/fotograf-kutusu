import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { lazy, Suspense, useEffect } from 'react'
import { CartProvider } from './context/CartContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { restoreConsoleForAdmin } from './utils/consoleGuard'
import { useSiteTheme } from './hooks/useSiteTheme'
import WhatsAppButton from './components/WhatsAppButton'
import AnnouncementPopup from './components/AnnouncementPopup'
import './App.css'

// Sadece admin giriş yaptığında console logları açılır
function ConsoleForAdmin() {
  const { user } = useAuth()
  useEffect(() => {
    if (user?.role === 'admin') restoreConsoleForAdmin()
  }, [user])
  return null
}

// Site renklerini API'den yükleyip :root CSS değişkenlerine uygular
function ThemeLoader() {
  useSiteTheme()
  return null
}

// Lazy load pages for code splitting
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
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const CategoriesListPage = lazy(() => import('./pages/CategoriesListPage'))
const FAQ = lazy(() => import('./pages/FAQ'))
const Reviews = lazy(() => import('./pages/Reviews'))
const NotificationSettings = lazy(() => import('./pages/NotificationSettings'))

// Loading component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    flexDirection: 'column',
    gap: '1rem'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #f3f4f6',
      borderTop: '4px solid #667eea',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <p style={{ color: '#6b7280' }}>Yükleniyor...</p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
)

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ThemeLoader />
        <ConsoleForAdmin />
        <CartProvider>
          <ToastProvider>
          <Router>
            <div className="App">
            <WhatsAppButton />
            <AnnouncementPopup />
            <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/kategoriler" element={<CategoriesListPage />} />
              <Route path="/kategori/:slug" element={<CategoryPage />} />
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
              <Route path="/faq" element={<FAQ />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/notification-settings" element={<NotificationSettings />} />
          </Routes>
          </Suspense>
        </div>
      </Router>
          </ToastProvider>
    </CartProvider>
  </AuthProvider>
    </HelmetProvider>
  )
}

export default App
