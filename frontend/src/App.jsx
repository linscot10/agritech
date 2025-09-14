// // src/App.jsx
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// import { AuthProvider } from './Contexts/AuthContext'
// import Layout from './components/common/Layout'
// import Login from './pages/Login'
// import Register from './pages/Register'
// import Dashboard from './pages/Dashboard'
// import './App.css'

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/*" element={<Layout />} />

//         </Routes> 
//       </Router>
//     </AuthProvider>
//   )
// }

// export default App


// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './Contexts/AuthContext'
import Layout from './components/common/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Inventory from './pages/Inventory'
import Orders from './pages/Orders'
import SupplyChain from './pages/SupplyChain'
import Sensors from './pages/Sensors'
import GeoData from './pages/GeoData'
import Weather from './pages/Weather'
import Analytics from './pages/Analytics'
import Forum from './pages/Forum'
import Notifications from './pages/Notifications'
import Programs from './pages/Programs'

import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="orders" element={<Orders />} />
            <Route path="supply-chain" element={<SupplyChain />} />
            <Route path="sensors" element={<Sensors />} />
            <Route path="geo-data" element={<GeoData />} />
            <Route path="weather" element={<Weather />} />
             <Route path="analytics" element={<Analytics />} />
               <Route path="forum" element={<Forum />} />
                    <Route path="notifications" element={<Notifications />} />
                     <Route path="programs" element={<Programs />} />
                    
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App