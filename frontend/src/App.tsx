
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import PublicPortfolioPage from './pages/PublicPortfolioPage'
import PublicProjectPage from './pages/PublicProjectPage'
import PasswordRecoveryPage from './pages/PasswordRecoveryPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

function ScrollRevealObserver() {
  const location = useLocation()

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return

    const root = document.getElementById('root')
    if (!root) return

    const selector =
      'main > section, main > article, main > .auth-card, main > .public-state, main > .dashboard-page, main .dashboard-main > section, main article'
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 },
    )

    function observeNewElements(node: Node) {
      if (!(node instanceof Element)) return
      if (node.matches(selector)) observeElement(node)
      node.querySelectorAll(selector).forEach(observeElement)
    }

    function observeElement(element: Element) {
      if (element.classList.contains('scroll-reveal')) return
      element.classList.add('scroll-reveal')
      observer.observe(element)
    }

    observeNewElements(root)

    const mutations = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach(observeNewElements)
      })
    })
    mutations.observe(root, { childList: true, subtree: true })

    return () => {
      mutations.disconnect()
      observer.disconnect()
      root.querySelectorAll('.scroll-reveal').forEach((element) => {
        element.classList.remove('scroll-reveal', 'is-visible')
      })
    }
  }, [location.pathname])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <ScrollRevealObserver />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<PasswordRecoveryPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/u/:username/projects/:slug" element={<PublicProjectPage />} />
        <Route path="/u/:username" element={<PublicPortfolioPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
