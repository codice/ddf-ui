import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Container,
} from '@mui/material'
import {
  LogoutOutlined,
  ErrorOutline,
  LoginOutlined,
} from '@mui/icons-material'

interface LogoutAction {
  auth: string
  description: string
  title: string
  url: string
}

interface UiConfig {
  productImage: string
  version: string
}

const LogoutProcess: React.FC = () => {
  const [state, setState] = useState<'initial' | 'processing' | 'error'>(
    'initial'
  )

  useEffect(() => {
    if (state === 'initial') {
      setState('processing')
      fetch('/services/logout/actions')
        .then((res) => res.json())
        .then((action: LogoutAction) => {
          if (action.url) {
            const url = new URL(action.url);
            const params = url.searchParams;
            const redirect = params.get("post_logout_redirect_uri")
            const newRedirect = redirect.replace("oidc\/logout\?", "oidc/logout?no-cache=" + Date.now() + "&")
            params.set("post_logout_redirect_uri", newRedirect)
            window.location.href = url
          } else {
            setState('error')
          }
        })
        .catch((error) => {
          console.error('Logout failed:', error)
          setState('error')
        })
    }
  }, [state])

  return (
    <div className="flex flex-col items-center gap-4 w-full h-full justify-center">
      {state === 'error' ? (
        <>
          {' '}
          <Box className="flex flex-col items-center gap-4 text-red-600">
            <ErrorOutline sx={{ fontSize: 48 }} />
            <Typography variant="h5">Logout Failed!</Typography>
            <Typography variant="subtitle1">
              Please notify a system administrator
            </Typography>
          </Box>
        </>
      ) : (
        <>
          {' '}
          <Box className="flex flex-col items-center gap-4">
            <CircularProgress size={48} />
            <Typography variant="h6">Logging out...</Typography>
          </Box>
        </>
      )}
    </div>
  )
}

const LogoutResponse: React.FC = () => {
  const [redirectUrl, setRedirectUrl] = useState<string>('')
  const [mustCloseBrowser, setMustCloseBrowser] = useState<boolean>(false)

  useEffect(() => {
    let url = window.location.href.replace(/\/logout\/.*/, '')
    const params = new URLSearchParams(window.location.search)
    setMustCloseBrowser(params.has('mustCloseBrowser'))
    const prevUrl = params.get('prevurl')

    if (prevUrl) {
      url = decodeURIComponent(prevUrl)
    }

    setRedirectUrl(url)
  }, [])

  return (
    <div className="flex flex-col items-center gap-4 w-full h-full justify-center">
      {mustCloseBrowser ? (
        <>
          <Box className="flex flex-col items-center gap-4">
            <LogoutOutlined sx={{ fontSize: 48, color: 'success.main' }} />
            <Typography variant="h5">You have been logged out</Typography>
            <Typography variant="subtitle1" className="text-center">
              Please close your browser to prevent reuse of cached credentials
            </Typography>
          </Box>
        </>
      ) : (
        <>
          {' '}
          <Box className="flex flex-col items-center gap-4">
            <LogoutOutlined sx={{ fontSize: 48, color: 'success.main' }} />
            <Typography variant="h5">You have been logged out</Typography>
            <Button
              className="!text-2xl"
              size="large"
              variant="text"
              color="primary"
              startIcon={<LoginOutlined />}
              href={redirectUrl}
            >
              Sign in again
            </Button>
          </Box>
        </>
      )}
    </div>
  )
}

const App: React.FC = () => {
  const [uiConfig, setUiConfig] = useState<UiConfig | null>(null)

  useEffect(() => {
    fetch('/services/platform/config/ui')
      .then((res) => res.json())
      .then((data: UiConfig) => {
        setUiConfig(data)
      })
      .catch(console.error)
  }, [])

  return (
    <Router>
      <Container className="w-full h-full">
        {uiConfig && (
          <Box className="absolute top-4 left-4 flex items-center gap-2">
            <img
              src={`data:image/png;base64,${uiConfig.productImage}`}
              alt="Product Logo"
              className="h-8"
            />
            <Typography variant="caption">v{uiConfig.version}</Typography>
          </Box>
        )}

        <div className="w-full h-full overflow-hidden p-8">
          <Routes>
            <Route path="/" element={<LogoutProcess />} />
            <Route path="/logout" element={<LogoutProcess />} />
            <Route
              path="/logout/logout-response.html"
              element={<LogoutResponse />}
            />
          </Routes>
        </div>
      </Container>
    </Router>
  )
}

export default App
