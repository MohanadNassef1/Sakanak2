 import React, { useState } from 'react';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { supabase } from '@/integrations/supabase/client';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
 import { toast } from 'sonner';
 import { Eye, EyeOff, Lock, Check } from 'lucide-react';
 
 const ChangePasswordForm: React.FC = () => {
   const { t } = useLanguage();
   const [currentPassword, setCurrentPassword] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
   const [showNewPassword, setShowNewPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState('');
 
   const validatePassword = (password: string): boolean => {
     return password.length >= 8;
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setError('');
 
     // Validate new password
     if (!validatePassword(newPassword)) {
       setError(t('profile.changePassword.minLength'));
       return;
     }
 
     // Check passwords match
     if (newPassword !== confirmPassword) {
       setError(t('profile.changePassword.mismatch'));
       return;
     }
 
     // Check new password is different from current
     if (currentPassword === newPassword) {
       setError(t('profile.changePassword.samePassword'));
       return;
     }
 
     setIsLoading(true);
 
     try {
       // Update password using Supabase
       const { error: updateError } = await supabase.auth.updateUser({
         password: newPassword
       });
 
       if (updateError) {
         if (updateError.message.includes('should be different')) {
           setError(t('profile.changePassword.samePassword'));
         } else {
           setError(updateError.message);
         }
         return;
       }
 
       // Success
       toast.success(t('profile.changePassword.success'));
       setCurrentPassword('');
       setNewPassword('');
       setConfirmPassword('');
     } catch (err) {
       setError(t('profile.changePassword.error'));
     } finally {
       setIsLoading(false);
     }
   };
 
   return (
     <Card>
       <CardHeader>
         <CardTitle className="flex items-center gap-2">
           <Lock className="w-5 h-5" />
           {t('profile.changePassword.title')}
         </CardTitle>
         <CardDescription>
           {t('profile.changePassword.description')}
         </CardDescription>
       </CardHeader>
       <CardContent>
         <form onSubmit={handleSubmit} className="space-y-4">
           {/* Current Password */}
           <div className="space-y-2">
             <Label htmlFor="currentPassword">{t('profile.changePassword.current')}</Label>
             <div className="relative">
               <Input
                 id="currentPassword"
                 type={showCurrentPassword ? 'text' : 'password'}
                 value={currentPassword}
                 onChange={(e) => setCurrentPassword(e.target.value)}
                 required
                 className="pr-10"
               />
               <button
                 type="button"
                 onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
               >
                 {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
               </button>
             </div>
           </div>
 
           {/* New Password */}
           <div className="space-y-2">
             <Label htmlFor="newPassword">{t('profile.changePassword.new')}</Label>
             <div className="relative">
               <Input
                 id="newPassword"
                 type={showNewPassword ? 'text' : 'password'}
                 value={newPassword}
                 onChange={(e) => setNewPassword(e.target.value)}
                 required
                 className="pr-10"
               />
               <button
                 type="button"
                 onClick={() => setShowNewPassword(!showNewPassword)}
                 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
               >
                 {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
               </button>
             </div>
             <p className="text-xs text-muted-foreground">
               {t('profile.changePassword.requirements')}
             </p>
           </div>
 
           {/* Confirm New Password */}
           <div className="space-y-2">
             <Label htmlFor="confirmPassword">{t('profile.changePassword.confirm')}</Label>
             <div className="relative">
               <Input
                 id="confirmPassword"
                 type={showConfirmPassword ? 'text' : 'password'}
                 value={confirmPassword}
                 onChange={(e) => setConfirmPassword(e.target.value)}
                 required
                 className="pr-10"
               />
               <button
                 type="button"
                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
               >
                 {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
               </button>
             </div>
             {confirmPassword && newPassword === confirmPassword && (
               <p className="text-xs text-primary flex items-center gap-1">
                 <Check className="w-3 h-3" />
                 {t('profile.changePassword.match')}
               </p>
             )}
           </div>
 
           {/* Error Message */}
           {error && (
             <p className="text-sm text-destructive">{error}</p>
           )}
 
           {/* Submit Button */}
           <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
             {isLoading ? t('common.saving') : t('profile.changePassword.submit')}
           </Button>
         </form>
       </CardContent>
     </Card>
   );
 };
 
 export default ChangePasswordForm;