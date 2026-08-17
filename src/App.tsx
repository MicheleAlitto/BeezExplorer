import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Blocks } from "./pages/Blocks";
import { BlockDetail } from "./pages/BlockDetail";
import { TxDetail } from "./pages/TxDetail";
import { AddressDetail } from "./pages/AddressDetail";
import { NotFound } from "./pages/NotFound";
import Guide from "./pages/Guide";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/blocks" element={<Blocks />} />
        <Route path="/block/:id" element={<BlockDetail />} />
        <Route path="/tx/:hash" element={<TxDetail />} />
        <Route path="/address/:addr" element={<AddressDetail />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/guide" element={<Guide />} />
      </Route>
    </Routes>
  );
}
