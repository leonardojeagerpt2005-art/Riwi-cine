import { createRoot } from 'react-dom/client'
import './index.css'
import { router } from './appRouter'
import { RouterProvider } from 'react-router'
import AuthProvider from './context/AuthContext'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>


    <RouterProvider router={router}/>
  </AuthProvider>
)
