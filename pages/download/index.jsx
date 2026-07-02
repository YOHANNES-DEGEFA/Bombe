import { motion } from "framer-motion";
import { Download, Smartphone, Tv } from "lucide-react";
import NavBar  from "../../components/NavBar";
import Footer  from "../../components/Footer";
export default function DownloadPage() {
    return (
        <main className="min-h-screen bg-primary text-textprimary flex flex-col items-center justify-center font-poppins">
            <NavBar />
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-center space-y-4 my-20"
            >
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="flex items-center justify-center gap-3"
                >
                    <Smartphone className="text-accent w-8 h-8" />
                    <h1 className="text-4xl font-semibold">Bombe App</h1>
                </motion.div>
                <p className="text-textsecondary max-w-md mx-auto">
                    Take your watchlists, favorites, and buddies anywhere.
                    Stream your world, now on Android and Android TV.
                </p>
            </motion.div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <motion.a
                    href="/downloads/Bombe.apk"
                    download
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="flex items-center justify-center gap-3 px-6 py-3 rounded-md bg-accent text-on-accent font-medium shadow-lg hover:bg-accent-hover transition-colors duration-200"
                >
                    <Download className="w-5 h-5" />
                    Download for Android
                </motion.a>

                <motion.a
                    href="https://Bombe.vercel.app/tv.apk"
                    download
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="flex items-center justify-center gap-3 px-6 py-3 rounded-md border border-accent text-accent font-medium shadow-lg hover:bg-accent hover:text-on-accent transition-colors duration-200"
                >
                    <Tv className="w-5 h-5" />
                    Download for Android TV
                </motion.a>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 text-center space-y-3"
            >
                <img
                    src="/images/app-preview.png"
                    alt="App Preview"
                    className="w-75 h-auto rounded-md shadow-lg mx-auto"
                />
                <p className="text-textsecondary text-sm">
                    For Downloader on Android TV, enter Bombe.vercel.app/tv.apk directly.
                </p>
            </motion.div>

            <Footer />
        </main>
    );
}
