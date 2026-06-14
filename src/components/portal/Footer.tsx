import { Facebook, Twitter, Instagram, Youtube, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
    const { t } = useLanguage();

    return (
        <footer className="bg-[#1a1f2c] text-white pt-16 pb-8 mt-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-portal-green rounded-lg flex items-center justify-center text-white">
                                <span className="font-bold text-lg">S</span>
                            </div>
                            <span className="text-xl font-bold">Sholok</span>
                        </Link>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            {t("footerTagline")}
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-portal-green transition-colors"><Facebook className="w-4 h-4" /></a>
                            <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-portal-green transition-colors"><Twitter className="w-4 h-4" /></a>
                            <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-portal-green transition-colors"><Instagram className="w-4 h-4" /></a>
                            <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-portal-green transition-colors"><Youtube className="w-4 h-4" /></a>
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="font-bold mb-4">{t("categories")}</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="#" className="hover:text-portal-green transition-colors">{t("entertainment")}</Link></li>
                            <li><Link to="#" className="hover:text-portal-green transition-colors">{t("sports")}</Link></li>
                            <li><Link to="#" className="hover:text-portal-green transition-colors">{t("economy")}</Link></li>
                            <li><Link to="#" className="hover:text-portal-green transition-colors">{t("webtoon")}</Link></li>
                            <li><Link to="#" className="hover:text-portal-green transition-colors">{t("fashionBeauty")}</Link></li>
                            <li><Link to="#" className="hover:text-portal-green transition-colors">{t("food")}</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="font-bold mb-4">{t("services")}</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="#" className="hover:text-portal-green transition-colors">{t("blog")}</Link></li>
                            <li><Link to="#" className="hover:text-portal-green transition-colors">{t("shopping")}</Link></li>
                            <li><Link to="#" className="hover:text-portal-green transition-colors">{t("news")}</Link></li>
                            <li><Link to="#" className="hover:text-portal-green transition-colors">{t("mail")}</Link></li>
                            <li><Link to="#" className="hover:text-portal-green transition-colors">{t("maps")}</Link></li>
                            <li><Link to="#" className="hover:text-portal-green transition-colors">{t("webtoon")}</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold mb-4">{t("contact")}</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-portal-green" />
                                <span>support@sholok.com</span>
                            </li>

                        </ul>
                    </div>
                </div>


            </div>
        </footer>
    );
};

export default Footer;
