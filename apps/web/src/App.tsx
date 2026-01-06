import { BrowserRouter, Routes, Route } from "react-router-dom";
import ArticlesIndex from "./pages/ArticlesIndex";
import ArticlePage from "./pages/ArticlePage";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<ArticlesIndex />} />
                <Route path="/articles/:slug" element={<ArticlePage />} />
            </Routes>
        </BrowserRouter>
    );
}