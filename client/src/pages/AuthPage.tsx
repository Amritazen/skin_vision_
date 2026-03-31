import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, InsertUser } from "@shared/schema";
import { Loader2, Facebook, Github, Linkedin } from "lucide-react";

export default function AuthPage() {
    const { user, loginMutation, registerMutation } = useAuth();
    const [, setLocation] = useLocation();
    const [isLoginMode, setIsLoginMode] = useState(true);

    useEffect(() => {
        if (user) {
            setLocation("/");
        }
    }, [user, setLocation]);

    const loginForm = useForm<InsertUser>({
        resolver: zodResolver(insertUserSchema),
        defaultValues: { username: "", password: "" },
    });

    const registerForm = useForm<InsertUser>({
        resolver: zodResolver(insertUserSchema),
        defaultValues: { username: "", password: "" },
    });

    if (user) return null;

    const onLogin = (data: InsertUser) => loginMutation.mutate(data);
    const onRegister = (data: InsertUser) => registerMutation.mutate(data);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f6f5f7] p-4 font-sans">
            <div className={`flex flex-col w-full max-w-[900px] min-h-[550px] bg-white rounded-[2rem] overflow-hidden shadow-2xl relative ${!isLoginMode ? 'md:flex-row-reverse' : 'md:flex-row'}`}>

                {/* Form Section */}
                <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col items-center justify-center transition-all duration-500 ease-in-out bg-white z-0">
                    <h1 className="text-4xl font-bold mb-6 text-slate-800 tracking-tight">
                        {isLoginMode ? "Sign In" : "Create Account"}
                    </h1>

                    <div className="flex gap-4 mb-6">
                        <button type="button" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-colors shadow-sm">
                            <Facebook className="w-5 h-5 fill-current" />
                        </button>
                        <button type="button" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors shadow-sm">
                            <Github className="w-5 h-5 fill-current" />
                        </button>
                        <button type="button" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors shadow-sm">
                            <Linkedin className="w-5 h-5 fill-current border-0" />
                        </button>
                    </div>

                    <p className="text-[13px] text-slate-400 mb-6 font-medium tracking-wide">
                        {isLoginMode ? "or use your account" : "or use your email for registration"}
                    </p>

                    {isLoginMode ? (
                        <form onSubmit={loginForm.handleSubmit(onLogin)} className="w-full max-w-[320px] flex flex-col items-center">
                            <div className="w-full mb-4">
                                <input
                                    {...loginForm.register("username")}
                                    type="text"
                                    placeholder="Username"
                                    className="w-full bg-[#f3f4f6] border-none rounded-lg px-4 py-3.5 text-slate-700 outline-none focus:ring-2 focus:ring-[#304ba3]/30 transition-all font-medium placeholder:font-normal placeholder:text-slate-400 text-sm"
                                />
                                {loginForm.formState.errors.username && (
                                    <p className="text-red-500 text-xs mt-1 text-left px-2">{loginForm.formState.errors.username.message}</p>
                                )}
                            </div>
                            <div className="w-full mb-4">
                                <input
                                    {...loginForm.register("password")}
                                    type="password"
                                    placeholder="Password"
                                    className="w-full bg-[#f3f4f6] border-none rounded-lg px-4 py-3.5 text-slate-700 outline-none focus:ring-2 focus:ring-[#304ba3]/30 transition-all font-medium placeholder:font-normal placeholder:text-slate-400 text-sm"
                                />
                                {loginForm.formState.errors.password && (
                                    <p className="text-red-500 text-xs mt-1 text-left px-2">{loginForm.formState.errors.password.message}</p>
                                )}
                            </div>

                            <a href="#" className="text-[13px] text-slate-500 hover:text-[#304ba3] mb-8 transition-colors font-medium">
                                Forgot your password?
                            </a>

                            <button
                                type="submit"
                                disabled={loginMutation.isPending}
                                className="bg-[#304ba3] hover:bg-[#23387d] text-white rounded-full px-12 py-3.5 font-bold uppercase tracking-[0.1em] text-sm shadow-[0_8px_20px_-6px_rgba(48,75,163,0.5)] hover:shadow-[0_10px_25px_-6px_rgba(48,75,163,0.6)] hover:-translate-y-0.5 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed w-48"
                            >
                                {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={registerForm.handleSubmit(onRegister)} className="w-full max-w-[320px] flex flex-col items-center animate-in fade-in duration-500">
                            <div className="w-full mb-4">
                                <input
                                    {...registerForm.register("username")}
                                    type="text"
                                    placeholder="Username"
                                    className="w-full bg-[#f3f4f6] border-none rounded-lg px-4 py-3.5 text-slate-700 outline-none focus:ring-2 focus:ring-[#304ba3]/30 transition-all font-medium placeholder:font-normal placeholder:text-slate-400 text-sm"
                                />
                                {registerForm.formState.errors.username && (
                                    <p className="text-red-500 text-xs mt-1 text-left px-2">{registerForm.formState.errors.username.message}</p>
                                )}
                            </div>
                            <div className="w-full mb-8">
                                <input
                                    {...registerForm.register("password")}
                                    type="password"
                                    placeholder="Password"
                                    className="w-full bg-[#f3f4f6] border-none rounded-lg px-4 py-3.5 text-slate-700 outline-none focus:ring-2 focus:ring-[#304ba3]/30 transition-all font-medium placeholder:font-normal placeholder:text-slate-400 text-sm"
                                />
                                {registerForm.formState.errors.password && (
                                    <p className="text-red-500 text-xs mt-1 text-left px-2">{registerForm.formState.errors.password.message}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={registerMutation.isPending}
                                className="bg-[#304ba3] hover:bg-[#23387d] text-white rounded-full px-12 py-3.5 font-bold uppercase tracking-[0.1em] text-sm shadow-[0_8px_20px_-6px_rgba(48,75,163,0.5)] hover:shadow-[0_10px_25px_-6px_rgba(48,75,163,0.6)] hover:-translate-y-0.5 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed w-48"
                            >
                                {registerMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
                            </button>
                        </form>
                    )}
                </div>

                {/* Promo/Switch Section */}
                <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col items-center justify-center text-center text-white bg-gradient-to-br from-[#304ba3] to-[#243572] transition-transform duration-500 ease-in-out relative z-10 box-border border-0 shadow-[0_0_20px_rgba(0,0,0,0.15)]">
                    <h2 className="text-3xl lg:text-4xl font-bold mb-6 tracking-tight">
                        {isLoginMode ? "Hey There!" : "Welcome Back!"}
                    </h2>
                    <p className="text-[15px] leading-relaxed opacity-90 mb-10 px-4 font-light">
                        {isLoginMode
                            ? "Begin your amazing journey by creating an account with us today"
                            : "To keep connected with us please login with your personal info"}
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            loginForm.reset();
                            registerForm.reset();
                            setIsLoginMode(!isLoginMode);
                        }}
                        className="bg-transparent border border-white/60 hover:border-white hover:bg-white/10 text-white rounded-full px-12 py-3 font-bold uppercase tracking-[0.1em] text-[13px] transition-all hover:scale-105 active:scale-95"
                    >
                        {isLoginMode ? "Sign Up" : "Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
}
