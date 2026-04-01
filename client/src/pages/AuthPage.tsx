import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, InsertUser } from "@shared/schema";
import { Loader2, ShieldCheck, Stethoscope } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AuthPage() {
    const { user, loginMutation, registerMutation } = useAuth();
    const [, setLocation] = useLocation();

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
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
            {/* Left side: branding/promo */}
            <div className="hidden md:flex flex-1 bg-[#304ba3] text-white p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-12">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <Stethoscope className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-display font-bold tracking-tight">SkinVision</span>
                    </div>
                    
                    <h1 className="text-5xl font-display font-bold leading-tight mb-6">
                        AI-Powered <br />
                        <span className="text-blue-200">Skin Health</span> Support.
                    </h1>
                    <p className="text-xl text-blue-100/80 max-w-md leading-relaxed font-light">
                        Expert dermatological assessment backed by clinical-grade computer vision models.
                    </p>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <ShieldCheck className="w-8 h-8 text-blue-200" />
                        <h3 className="font-bold">Medical Grade</h3>
                        <p className="text-sm text-blue-100/60">Trained on thousands of clinical cases.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="w-8 h-8 rounded-full border-2 border-blue-200 flex items-center justify-center font-bold text-blue-200">AI</div>
                        <h3 className="font-bold">Instant Analysis</h3>
                        <p className="text-sm text-blue-100/60">Get results in under 5 seconds.</p>
                    </div>
                </div>
            </div>

            {/* Right side: Auth forms */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12">
                <Card className="w-full max-w-md border-0 shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                    <Tabs defaultValue="login" className="w-full">
                        <CardHeader className="text-center pb-2">
                            <div className="md:hidden flex justify-center mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center">
                                    <Stethoscope className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-display font-bold">Welcome back</CardTitle>
                            <CardDescription>
                                Access your skin health dashboard
                            </CardDescription>
                            
                            <TabsList className="grid w-full grid-cols-2 mt-8 rounded-full bg-slate-100 p-1">
                                <TabsTrigger value="login" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign In</TabsTrigger>
                                <TabsTrigger value="register" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
                            </TabsList>
                        </CardHeader>
                        
                        <CardContent className="pt-6">
                            <TabsContent value="login" className="mt-0">
                                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-username">Username</Label>
                                        <Input
                                            id="login-username"
                                            {...loginForm.register("username")}
                                            placeholder="Enter your username"
                                            className="rounded-xl border-slate-200 h-11"
                                        />
                                        {loginForm.formState.errors.username && (
                                            <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.username.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="login-password">Password</Label>
                                            <button type="button" className="text-xs text-blue-600 hover:underline font-medium">Forgot password?</button>
                                        </div>
                                        <Input
                                            id="login-password"
                                            {...loginForm.register("password")}
                                            type="password"
                                            placeholder="••••••••"
                                            className="rounded-xl border-slate-200 h-11"
                                        />
                                        {loginForm.formState.errors.password && (
                                            <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.password.message}</p>
                                        )}
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={loginMutation.isPending}
                                        className="w-full rounded-xl h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all mt-6"
                                    >
                                        {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                        Sign In
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="register" className="mt-0 font-sans">
                                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-username">Choose Username</Label>
                                        <Input
                                            id="reg-username"
                                            {...registerForm.register("username")}
                                            placeholder="Pick a unique username"
                                            className="rounded-xl border-slate-200 h-11"
                                        />
                                        {registerForm.formState.errors.username && (
                                            <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.username.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-password">Password</Label>
                                        <Input
                                            id="reg-password"
                                            {...registerForm.register("password")}
                                            type="password"
                                            placeholder="Minimum 6 characters"
                                            className="rounded-xl border-slate-200 h-11"
                                        />
                                        {registerForm.formState.errors.password && (
                                            <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.password.message}</p>
                                        )}
                                    </div>
                                    <div className="flex items-start gap-2 mt-4 px-1">
                                        <input type="checkbox" id="terms" className="mt-1 accent-blue-600" required />
                                        <label htmlFor="terms" className="text-xs text-slate-500 leading-normal">
                                            I agree to the <button type="button" className="text-blue-600 hover:underline">Terms of Service</button> and <button type="button" className="text-blue-600 hover:underline">Privacy Policy</button>.
                                        </label>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={registerMutation.isPending}
                                        className="w-full rounded-xl h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all mt-6"
                                    >
                                        {registerMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                        Create Account
                                    </Button>
                                </form>
                            </TabsContent>
                        </CardContent>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
}
