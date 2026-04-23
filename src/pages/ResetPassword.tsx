 import React, { useState, useEffect } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { supabase } from '@/integrations/supabase/client';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Globe, Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
 import { z } from 'zod';
 
 const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
 
 const ResetPasswordContent: React.FC = () => {
   const { t, language, setLanguage, isRTL } = useLanguage();
   const navigate = useNavigate();
   
   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [success, setSuccess] = useState('');
   const [isValidSession, setIsValidSession] = useState(false);
   const [checkingSession, setCheckingSession] = useState(true);
 
   useEffect(() => {
     // Check if we have a valid session from the password reset link
     const checkSession = async () => {
       const { data: { session } } = await supabase.auth.getSession();
       if (session) {
         setIsValidSession(true);
       }
       setCheckingSession(false);
     };
     
     checkSession();
   }, []);
 
   const toggleLanguage = () => {
     setLanguage(language === 'en' ? 'ar' : 'en');
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setError('');
     setSuccess('');
 
     // Validate password
     try {
       passwordSchema.parse(password);
     } catch (err) {
       if (err instanceof z.ZodError) {
         setError(err.errors[0].message);
         return;
       }
     }
 
     // Check passwords match
     if (password !== confirmPassword) {
       setError(t('resetPassword.passwordsMustMatch'));
       return;
     }
 
     setLoading(true);
 
     try {
       const { error } = await supabase.auth.updateUser({
         password: password
       });
 
       if (error) {
         setError(error.message);
       } else {
         setSuccess(t('resetPassword.success'));
         // Redirect to home after 2 seconds
         setTimeout(() => {
           navigate('/');
         }, 2000);
       }
     } finally {
       setLoading(false);
     }
   };
 
   if (checkingSession) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-secondary/30">
         <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
       </div>
     );
   }
 
   if (!isValidSession) {
     return (
       <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-6">
         <div className="w-full max-w-md text-center">
           <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
             <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
             <h2 className="text-2xl font-bold text-foreground mb-2">
               {t('resetPassword.invalidLink')}
             </h2>
             <p className="text-muted-foreground mb-6">
               {t('resetPassword.invalidLinkDesc')}
             </p>
             <Button onClick={() => navigate('/auth')} className="w-full">
               {t('resetPassword.backToLogin')}
             </Button>
           </div>
         </div>
       </div>
     );
   }
 
   return (
     <div className="min-h-screen bg-secondary/30 flex flex-col">
       {/* Header */}
       <div className="flex items-center justify-between p-4 lg:p-6">
         <a href="/" className="flex items-center gap-2">
           <span className="text-2xl font-bold text-primary">Sakanak</span>
         </a>
         <button
           onClick={toggleLanguage}
           className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
         >
           <Globe className="w-4 h-4" />
           <span className="text-sm font-medium">{language === 'en' ? 'العربية' : 'EN'}</span>
         </button>
       </div>
 
       {/* Form Container */}
       <div className="flex-1 flex items-center justify-center p-6">
         <div className="w-full max-w-md">
           {/* Header */}
           <div className="text-center mb-8">
             <h2 className="text-3xl font-bold text-foreground mb-2">
               {t('resetPassword.title')}
             </h2>
             <p className="text-muted-foreground">
               {t('resetPassword.subtitle')}
             </p>
           </div>
 
           {/* Form Card */}
           <div className="bg-card rounded-2xl p-6 md:p-8 shadow-lg border border-border">
             <form onSubmit={handleSubmit} className="space-y-5">
               {/* Success Message */}
               {success && (
                 <div className="flex items-center gap-3 p-4 rounded-xl bg-sakanak-success/10 border border-sakanak-success/20">
                   <CheckCircle className="w-5 h-5 text-sakanak-success flex-shrink-0" />
                   <p className="text-sm text-sakanak-success">{success}</p>
                 </div>
               )}
 
               {/* Error Message */}
               {error && (
                 <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                   <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                   <p className="text-sm text-destructive">{error}</p>
                 </div>
               )}
 
               {/* New Password */}
               <div className="space-y-2">
                 <Label htmlFor="password" className="text-foreground font-medium">
                   {t('resetPassword.newPassword')}
                 </Label>
                 <div className="relative">
                   <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                   <Input
                     id="password"
                     type={showPassword ? 'text' : 'password'}
                     placeholder={t('resetPassword.newPasswordPlaceholder')}
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className={`${isRTL ? 'pr-11 pl-11' : 'pl-11 pr-11'} h-12 rounded-xl border-border bg-background`}
                   />
                   <button
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors ${isRTL ? 'left-3' : 'right-3'}`}
                   >
                     {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                   </button>
                 </div>
               </div>
 
               {/* Confirm Password */}
               <div className="space-y-2">
                 <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                   {t('resetPassword.confirmPassword')}
                 </Label>
                 <div className="relative">
                   <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                   <Input
                     id="confirmPassword"
                     type={showConfirmPassword ? 'text' : 'password'}
                     placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                     value={confirmPassword}
                     onChange={(e) => setConfirmPassword(e.target.value)}
                     className={`${isRTL ? 'pr-11 pl-11' : 'pl-11 pr-11'} h-12 rounded-xl border-border bg-background`}
                   />
                   <button
                     type="button"
                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                     className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors ${isRTL ? 'left-3' : 'right-3'}`}
                   >
                     {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                   </button>
                 </div>
               </div>
 
               {/* Submit Button */}
               <Button
                 type="submit"
                 disabled={loading}
                 className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base rounded-xl gap-2"
               >
                 {loading ? (
                   <Loader2 className="w-5 h-5 animate-spin" />
                 ) : (
                   <>
                     {t('resetPassword.updatePassword')}
                     <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                   </>
                 )}
               </Button>
             </form>
           </div>
         </div>
       </div>
     </div>
   );
 };
 
 const ResetPassword: React.FC = () => {
   return <ResetPasswordContent />;
 };
 
 export default ResetPassword;