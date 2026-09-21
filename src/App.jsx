import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Spinner from "./components/Spinner";

// Код каждой страницы грузится отдельным чанком по мере навигации, а не всё
// одним файлом сразу — так первая загрузка сайта (обычно лендинг) весит меньше.
const Home = lazy(() => import("./pages/Home"));
const TestPage = lazy(() => import("./pages/TestPage"));
const ResultPage = lazy(() => import("./pages/ResultPage"));
const ReactionTest = lazy(() => import("./pages/ReactionTest"));
const ReactionResult = lazy(() => import("./pages/ReactionResult"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const LegalDoc = lazy(() => import("./pages/LegalDoc"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test/reaction-speed" element={<ReactionTest />} />
          <Route path="/test/reaction-speed/result" element={<ReactionResult />} />
          <Route path="/test/:slug" element={<TestPage />} />
          <Route path="/test/:slug/result" element={<ResultPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/docs/:docKey" element={<LegalDoc />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
