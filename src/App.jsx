import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import CartPanel from './components/CartPanel';
import Welcome from './components/Welcome';
import Products from './components/Products';
import WhyUs from './components/WhyUs';
import Footer from './components/Footer';
import Notification from './components/Notification';
import './App.css';

function App() {
  return (
    <CartProvider>
      <Header />
      <CartPanel />
      <Welcome />
      <Products />
      <WhyUs />
      <Footer />
      <Notification />
    </CartProvider>
  );
}

export default App;
