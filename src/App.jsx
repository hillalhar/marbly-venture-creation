import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Belajar from "./pages/Belajar.jsx";
import Artikel from "./pages/Artikel.jsx";
import Resep from "./pages/Resep.jsx";
import ResepDetail from "./pages/ResepDetail.jsx";
import Toko from "./pages/Toko.jsx";
import ProdukDetail from "./pages/ProdukDetail.jsx";
import Keranjang from "./pages/Keranjang.jsx";
import Checkout from "./pages/Checkout.jsx";
import Pesanan from "./pages/Pesanan.jsx";
import PesananDetail from "./pages/PesananDetail.jsx";
import Kulkas from "./pages/Kulkas.jsx";
import Alat from "./pages/Alat.jsx";
import Akun from "./pages/Akun.jsx";
import NotFound from "./pages/NotFound.jsx";
import KreditFoto from "./pages/KreditFoto.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/belajar" element={<Belajar />} />
        <Route path="/belajar/artikel/:slug" element={<Artikel />} />
        <Route path="/resep" element={<Resep />} />
        <Route path="/resep/:id" element={<ResepDetail />} />
        <Route path="/toko" element={<Toko />} />
        <Route path="/toko/:sku" element={<ProdukDetail />} />
        <Route path="/keranjang" element={<Keranjang />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/pesanan" element={<Pesanan />} />
        <Route path="/pesanan/:id" element={<PesananDetail />} />
        <Route path="/kulkas" element={<Kulkas />} />
        <Route path="/alat" element={<Alat />} />
        <Route path="/akun" element={<Akun />} />
        <Route path="/kredit-foto" element={<KreditFoto />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
