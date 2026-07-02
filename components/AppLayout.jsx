import NavBar from "./NavBar";
import Footer from "./Footer";

export default function AppLayout({ children }) {
  return (
    <div className="bg-primary text-textprimary min-h-screen flex flex-col font-poppins">
      <NavBar />
      <div className="flex-grow pt-16">{children}</div>
      <Footer />
    </div>
  );
}
