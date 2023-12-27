import Home from './pages/Home'
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {useCookies} from "react-cookie";
const App = () => {

  const [cookies, setCookie, removeCookie ] = useCookies(['user'])
  const authToken = cookies.AuthToken
  return (
    <div className="App">
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        { authToken && <Route path="/dashboard" element={<Dashboard/>}/>}
        { authToken && <Route path="/onboarding" element={<Onboarding/>}/>}
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
