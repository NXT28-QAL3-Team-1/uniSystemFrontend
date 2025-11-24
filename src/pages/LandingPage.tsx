import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    GraduationCap,
    BookOpen,
    Users,
    Calendar,
    Award,
    TrendingUp,
    CheckCircle,
    ArrowRight,
    Mail,
    Headphones,
} from "lucide-react";
import "../animations.css";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 fixed w-full top-0 z-50">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-center">
                        <div className="flex items-center space-x-3">
                            <GraduationCap className="w-8 h-8 text-blue-600" />
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                UniSystem
                            </span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 overflow-hidden">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center space-y-8 relative">
                        {/* Floating decorative elements */}
                        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                        <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
                        
                        <div className="relative z-10">
                            <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-fade-in-up">
                                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent inline-block animate-gradient">
                                    Modern Education
                                </span>
                                <br />
                                <span className="text-gray-800">
                                    Management System
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
                                Streamline your academic operations with our
                                comprehensive university management platform.
                                Empowering students, faculty, and administrators.
                            </p>
                            <div className="flex justify-center items-center pt-4 animate-fade-in-up animation-delay-400">
                                <Button
                                    onClick={() => navigate("/login")}
                                    size="lg"
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                                >
                                    Get Started
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-6 bg-white/50">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
                        Powerful Features
                    </h2>
                    <p className="text-center text-gray-600 mb-16 text-lg">
                        Everything you need to manage your academic institution
                        efficiently
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature Cards */}
                        <div className="animate-fade-in-up animation-delay-100">
                            <FeatureCard
                                icon={<Users className="w-10 h-10" />}
                                title="Student Management"
                                description="Efficiently manage student records, enrollment, and academic progress in one centralized system."
                                gradient="from-blue-500 to-cyan-500"
                            />
                        </div>
                        <div className="animate-fade-in-up animation-delay-200">
                            <FeatureCard
                                icon={<BookOpen className="w-10 h-10" />}
                                title="Course Administration"
                                description="Create and manage courses, curricula, and academic programs with ease."
                                gradient="from-purple-500 to-pink-500"
                            />
                        </div>
                        <div className="animate-fade-in-up animation-delay-300">
                            <FeatureCard
                                icon={<Calendar className="w-10 h-10" />}
                                title="Schedule Management"
                                description="Organize classes, exams, and academic events with intelligent scheduling tools."
                                gradient="from-green-500 to-emerald-500"
                            />
                        </div>
                        <div className="animate-fade-in-up animation-delay-400">
                            <FeatureCard
                                icon={<Award className="w-10 h-10" />}
                                title="Grades & Assessment"
                                description="Track student performance, manage grades, and generate comprehensive reports."
                                gradient="from-orange-500 to-red-500"
                            />
                        </div>
                        <div className="animate-fade-in-up animation-delay-500">
                            <FeatureCard
                                icon={<TrendingUp className="w-10 h-10" />}
                                title="Analytics & Reports"
                                description="Make data-driven decisions with powerful analytics and detailed reporting."
                                gradient="from-indigo-500 to-purple-500"
                            />
                        </div>
                        <div className="animate-fade-in-up animation-delay-600">
                            <FeatureCard
                                icon={<CheckCircle className="w-10 h-10" />}
                                title="Attendance Tracking"
                                description="Monitor attendance in real-time and maintain accurate attendance records."
                                gradient="from-teal-500 to-cyan-500"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-6 text-gray-800">
                                Built for{" "}
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Everyone
                                </span>
                            </h2>
                            <div className="space-y-6">
                                <BenefitItem
                                    title="For Students"
                                    description="Access courses, grades, schedules, and manage department selections effortlessly."
                                />
                                <BenefitItem
                                    title="For Faculty"
                                    description="Manage courses, track attendance, grade assignments, and communicate with students."
                                />
                                <BenefitItem
                                    title="For Administrators"
                                    description="Oversee all academic operations, generate reports, and make informed decisions."
                                />
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-8 shadow-xl">
                            <div className="bg-white rounded-2xl p-8 space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <GraduationCap className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            Comprehensive Platform
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            All-in-one solution
                                        </p>
                                    </div>
                                </div>
                                <div className="h-px bg-gray-200"></div>
                                <p className="text-gray-600 leading-relaxed">
                                    UniSystem provides a unified platform for
                                    managing all aspects of academic life, from
                                    enrollment to graduation, with intuitive
                                    tools designed for the modern educational
                                    environment.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="container mx-auto max-w-4xl text-center text-white">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl text-blue-100">
                        Join thousands of institutions transforming education
                        with UniSystem
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-12 gap-8 mb-12">
                        {/* Logo and Description */}
                        <div className="md:col-span-5">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-xl">
                                    <GraduationCap className="w-8 h-8 text-white" />
                                </div>
                                <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    UniSystem
                                </span>
                            </div>
                            <p className="text-gray-400 leading-relaxed text-base mb-6 max-w-sm">
                                Transforming education through innovative technology. 
                                Empowering students, faculty, and administrators to achieve 
                                academic excellence in the digital age.
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span>System Active</span>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="md:col-span-3">
                            <h3 className="text-white font-bold mb-6 text-lg uppercase tracking-wider">
                                Navigate
                            </h3>
                            <ul className="space-y-3">
                                <li>
                                    <a
                                        href="#features"
                                        className="text-gray-400 hover:text-blue-400 transition-all duration-300 flex items-center group text-sm"
                                    >
                                        <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#benefits"
                                        className="text-gray-400 hover:text-blue-400 transition-all duration-300 flex items-center group text-sm"
                                    >
                                        <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                                        Benefits
                                    </a>
                                </li>
                                <li>
                                    <button
                                        onClick={() => navigate("/login")}
                                        className="text-gray-400 hover:text-blue-400 transition-all duration-300 flex items-center group text-sm"
                                    >
                                        <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                                        Portal Access
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="md:col-span-4">
                            <h3 className="text-white font-bold mb-6 text-lg uppercase tracking-wider">
                                Get in Touch
                            </h3>
                            <div className="space-y-4">
                                <a 
                                    href="mailto:info@unisystem.edu"
                                    className="flex items-center group cursor-pointer"
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center mr-4 group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-all border border-blue-500/30">
                                        <Mail className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs mb-0.5 uppercase tracking-wide">General Inquiries</p>
                                        <p className="text-gray-300 text-sm font-medium group-hover:text-blue-400 transition-colors">info@unisystem.edu</p>
                                    </div>
                                </a>
                                <a 
                                    href="mailto:support@unisystem.edu"
                                    className="flex items-center group cursor-pointer"
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center mr-4 group-hover:from-purple-500/30 group-hover:to-purple-600/30 transition-all border border-purple-500/30">
                                        <Headphones className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs mb-0.5 uppercase tracking-wide">Technical Support</p>
                                        <p className="text-gray-300 text-sm font-medium group-hover:text-purple-400 transition-colors">support@unisystem.edu</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-gray-700/50 pt-8 mt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-gray-500 text-sm">
                                © 2025 <span className="text-gray-400 font-semibold">UniSystem</span>. All rights reserved.
                            </p>
                            <div className="flex items-center gap-6">
                                <a href="#" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">Privacy Policy</a>
                                <a href="#" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">Terms of Service</a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
    gradient,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    gradient: string;
}) {
    return (
        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:scale-105 hover:-translate-y-2">
            <div
                className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white mb-6 shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
            >
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
    );
}

function BenefitItem({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
                <h3 className="font-semibold text-lg text-gray-800 mb-1">
                    {title}
                </h3>
                <p className="text-gray-600">{description}</p>
            </div>
        </div>
    );
}
