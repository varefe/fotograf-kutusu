import { createContext, useContext, useState, useEffect } from 'react'
import { API_URL } from '../config/api'
import { getBrowserId } from '../utils/browserFingerprint'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Token ve kullanıcı bilgilerini yükle (tarayıcıya özel)
  useEffect(() => {
    const browserId = getBrowserId()
    
    // Önce localStorage'dan kontrol et (Beni Hatırla seçiliyse)
    const rememberedToken = localStorage.getItem(`authToken_${browserId}`)
    const rememberedUser = localStorage.getItem(`user_${browserId}`)
    
    // Sonra sessionStorage'dan kontrol et (Beni Hatırla seçili değilse)
    const sessionToken = sessionStorage.getItem(`authToken_${browserId}`)
    const sessionUser = sessionStorage.getItem(`user_${browserId}`)
    
    // Öncelik: localStorage (Beni Hatırla), sonra sessionStorage
    const savedToken = rememberedToken || sessionToken
    const savedUser = rememberedUser || sessionUser

    if (savedToken && savedUser) {
      try {
        // Tarayıcı ID'sini kontrol et
        const userData = JSON.parse(savedUser)
        if (userData.browserId && userData.browserId !== browserId) {
          // Farklı tarayıcı - oturumu temizle
          console.warn('⚠️ Farklı tarayıcı tespit edildi, oturum temizleniyor')
          // Storage'ları temizle
          localStorage.removeItem(`authToken_${browserId}`)
          localStorage.removeItem(`user_${browserId}`)
          sessionStorage.removeItem(`authToken_${browserId}`)
          sessionStorage.removeItem(`user_${browserId}`)
          setUser(null)
          setToken(null)
          setLoading(false)
          return
        }
        
        setToken(savedToken)
        setUser(userData)
        // Token'ı doğrula
        verifyToken(savedToken)
      } catch (error) {
        console.error('Token yükleme hatası:', error)
        logout()
      }
    }
    setLoading(false)
  }, [])

  // Token doğrulama
  const verifyToken = async (tokenToVerify) => {
    try {
      // API_URL zaten tam URL ise (https://...) /api ekle, değilse olduğu gibi kullan
      let apiEndpoint
      if (API_URL.startsWith('http://') || API_URL.startsWith('https://')) {
        apiEndpoint = `${API_URL}/api/user/profile`
      } else {
        apiEndpoint = `${API_URL}/user/profile`
      }
      const response = await fetch(apiEndpoint, {
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`
        }
      })

      if (!response.ok) {
        throw new Error('Token geçersiz')
      }

      const data = await response.json()
      if (data.success) {
        const browserId = getBrowserId()
        const userData = { ...data.user, browserId }
        setUser(userData)
        
        // Mevcut storage'ları kontrol et
        const rememberedToken = localStorage.getItem(`authToken_${browserId}`)
        if (rememberedToken) {
          localStorage.setItem(`user_${browserId}`, JSON.stringify(userData))
        } else {
          sessionStorage.setItem(`user_${browserId}`, JSON.stringify(userData))
        }
      }
    } catch (error) {
      console.error('Token doğrulama hatası:', error)
      logout()
    }
  }

  // Giriş yap
  const login = async (email, password, rememberMe = false) => {
    try {
      const browserId = getBrowserId()
      // API_URL zaten tam URL ise (https://...) /api ekle, değilse olduğu gibi kullan
      let apiEndpoint
      if (API_URL.startsWith('http://') || API_URL.startsWith('https://')) {
        // Tam URL - /api ekle
        apiEndpoint = `${API_URL}/api/user/login`
      } else {
        // Relative path (/api gibi)
        apiEndpoint = `${API_URL}/user/login`
      }
      console.log('🔍 Login API Endpoint:', apiEndpoint)
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success) {
        setToken(data.token)
        const userData = { ...data.user, browserId }
        setUser(userData)
        
        // "Beni Hatırla" seçiliyse localStorage, değilse sessionStorage kullan
        if (rememberMe) {
          localStorage.setItem(`authToken_${browserId}`, data.token)
          localStorage.setItem(`user_${browserId}`, JSON.stringify(userData))
          // sessionStorage'daki eski verileri temizle
          sessionStorage.removeItem(`authToken_${browserId}`)
          sessionStorage.removeItem(`user_${browserId}`)
        } else {
          sessionStorage.setItem(`authToken_${browserId}`, data.token)
          sessionStorage.setItem(`user_${browserId}`, JSON.stringify(userData))
          // localStorage'daki eski verileri temizle
          localStorage.removeItem(`authToken_${browserId}`)
          localStorage.removeItem(`user_${browserId}`)
        }
        
        return { success: true, user: userData }
      } else {
        return { success: false, error: data.message || 'Giriş başarısız' }
      }
    } catch (error) {
      console.error('Giriş hatası:', error)
      return { success: false, error: 'Giriş yapılırken bir hata oluştu' }
    }
  }

  // Kayıt ol
  const register = async (email, password, firstName, lastName, phone, address) => {
    try {
      // API_URL zaten tam URL ise (https://...) /api ekle, değilse olduğu gibi kullan
      let apiEndpoint
      if (API_URL.startsWith('http://') || API_URL.startsWith('https://')) {
        apiEndpoint = `${API_URL}/api/user/register`
      } else {
        apiEndpoint = `${API_URL}/user/register`
      }
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          phone,
          address
        })
      })

      const data = await response.json()

      if (data.success) {
        const browserId = getBrowserId()
        setToken(data.token)
        const userData = { ...data.user, browserId }
        setUser(userData)
        // Kayıt sonrası varsayılan olarak sessionStorage kullan (Beni Hatırla seçili değil)
        sessionStorage.setItem(`authToken_${browserId}`, data.token)
        sessionStorage.setItem(`user_${browserId}`, JSON.stringify(userData))
        return { success: true }
      } else {
        return { success: false, error: data.message || 'Kayıt başarısız' }
      }
    } catch (error) {
      console.error('Kayıt hatası:', error)
      return { success: false, error: 'Kayıt olurken bir hata oluştu' }
    }
  }

  // Çıkış yap
  const logout = () => {
    const browserId = getBrowserId()
    setUser(null)
    setToken(null)
    // Her iki storage'dan da temizle
    localStorage.removeItem(`authToken_${browserId}`)
    localStorage.removeItem(`user_${browserId}`)
    sessionStorage.removeItem(`authToken_${browserId}`)
    sessionStorage.removeItem(`user_${browserId}`)
  }

  // Profil güncelle
  const updateProfile = async (firstName, lastName, phone, address) => {
    try {
      // API_URL zaten tam URL ise (https://...) /api ekle, değilse olduğu gibi kullan
      let apiEndpoint
      if (API_URL.startsWith('http://') || API_URL.startsWith('https://')) {
        apiEndpoint = `${API_URL}/api/user/profile`
      } else {
        apiEndpoint = `${API_URL}/user/profile`
      }
      const response = await fetch(apiEndpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          address
        })
      })

      const data = await response.json()

      if (data.success) {
        const browserId = getBrowserId()
        const userData = { ...data.user, browserId }
        setUser(userData)
        
        // Mevcut storage'ları kontrol et ve güncelle
        const rememberedToken = localStorage.getItem(`authToken_${browserId}`)
        if (rememberedToken) {
          localStorage.setItem(`user_${browserId}`, JSON.stringify(userData))
        } else {
          sessionStorage.setItem(`user_${browserId}`, JSON.stringify(userData))
        }
        
        return { success: true }
      } else {
        return { success: false, error: data.message || 'Profil güncellenemedi' }
      }
    } catch (error) {
      console.error('Profil güncelleme hatası:', error)
      return { success: false, error: 'Profil güncellenirken bir hata oluştu' }
    }
  }

  // Şifre değiştir
  const changePassword = async (currentPassword, newPassword) => {
    try {
      // API_URL zaten tam URL ise (https://...) /api ekle, değilse olduğu gibi kullan
      let apiEndpoint
      if (API_URL.startsWith('http://') || API_URL.startsWith('https://')) {
        apiEndpoint = `${API_URL}/api/user/change-password`
      } else {
        apiEndpoint = `${API_URL}/user/change-password`
      }
      const response = await fetch(apiEndpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const data = await response.json()

      if (data.success) {
        return { success: true }
      } else {
        return { success: false, error: data.message || 'Şifre değiştirilemedi' }
      }
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error)
      return { success: false, error: 'Şifre değiştirilirken bir hata oluştu' }
    }
  }

  // API istekleri için token header'ı
  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Admin kontrolü
  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        getAuthHeaders,
        isAuthenticated: !!user,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

