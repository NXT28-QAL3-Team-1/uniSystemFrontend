import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Moon, Sun, Globe, GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";

export default function PublicNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const [isDark, setIsDark] = useState(() => {
        // Initialize from localStorage immediately
        const stored = localStorage.getItem("darkMode");
        const darkMode = stored === "true";
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        return darkMode;
    });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleDarkMode = () => {
        const newDarkMode = !isDark;
        setIsDark(newDarkMode);
        localStorage.setItem("darkMode", String(newDarkMode));
        if (newDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === "en" ? "ar" : "en";
        i18n.changeLanguage(newLang);
        document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const navLinkClass = (path: string) => {
        return isActive(path)
            ? "text-blue-600 dark:text-blue-400 font-semibold"
            : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium";
    };

    return (
        <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 fixed w-full top-0 z-50 transition-colors duration-300">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div
                        className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer"
                        onClick={() => navigate("/")}>
                        <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
                            {t("landing.appName")}
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {location.pathname === "/" ? (
                            <>
                                <a
                                    href="#home"
                                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                                    {t("landing.nav.home")}
                                </a>
                                <a
                                    href="#features"
                                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                                    {t("landing.nav.features")}
                                </a>
                            </>
                        ) : (
                            <button
                                onClick={() => navigate("/")}
                                className={navLinkClass("/")}>
                                {t("landing.nav.home")}
                            </button>
                        )}
                        <button
                            onClick={() => navigate("/about")}
                            className={navLinkClass("/about")}>
                            {t("landing.nav.about")}
                        </button>
                        <button
                            onClick={() => navigate("/vision")}
                            className={navLinkClass("/vision")}>
                            {t("landing.nav.vision")}
                        </button>
                        <button
                            onClick={() => navigate("/contact")}
                            className={navLinkClass("/contact")}>
                            {t("landing.nav.contact")}
                        </button>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3">
                        {/* Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="Toggle language">
                            <Globe className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="Toggle dark mode">
                            {isDark ? (
                                <Sun className="w-5 h-5 text-yellow-500" />
                            ) : (
                                <Moon className="w-5 h-5 text-gray-700" />
                            )}
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden pt-4 pb-3 border-t border-gray-200 dark:border-gray-700 mt-4 animate-fade-in-up">
                        <div className="flex flex-col gap-3">
                            {location.pathname === "/" ? (
                                <>
                                    <a
                                        href="#home"
                                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium py-2">
                                        {t("landing.nav.home")}
                                    </a>
                                    <a
                                        href="#features"
                                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium py-2">
                                        {t("landing.nav.features")}
                                    </a>
                                </>
                            ) : (
                                <button
                                    onClick={() => navigate("/")}
                                    className={`${navLinkClass(
                                        "/"
                                    )} py-2 text-start`}>
                                    {t("landing.nav.home")}
                                </button>
                            )}
                            <button
                                onClick={() => navigate("/about")}
                                className={`${navLinkClass(
                                    "/about"
                                )} py-2 text-start`}>
                                {t("landing.nav.about")}
                            </button>
                            <button
                                onClick={() => navigate("/vision")}
                                className={`${navLinkClass(
                                    "/vision"
                                )} py-2 text-start`}>
                                {t("landing.nav.vision")}
                            </button>
                            <button
                                onClick={() => navigate("/contact")}
                                className={`${navLinkClass(
                                    "/contact"
                                )} py-2 text-start`}>
                                {t("landing.nav.contact")}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
