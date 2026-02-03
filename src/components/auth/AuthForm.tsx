import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { z } from 'zod';

// Validation schemas
const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

interface AuthFormProps {
  mode: 'login' | 'signup';
  onToggleMode: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onToggleMode }) => {
  const { signIn, signUp } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateFields = (): boolean => {
    const errors: Record<string, string> = {};

    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        errors.email = e.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        errors.password = e.errors[0].message;
      }
    }

    if (mode === 'signup') {
      try {
        nameSchema.parse(fullName);
      } catch (e) {
        if (e instanceof z.ZodError) {
          errors.fullName = e.errors[0].message;
        }
      }

      if (!gender) {
        errors.gender = 'Please select your gender';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateFields()) {
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError(t('auth.error.invalidCredentials'));
          } else if (error.message.includes('Email not confirmed')) {
            setError(t('auth.error.emailNotConfirmed'));
          } else {
            setError(error.message);
          }
        } else {
          navigate('/');
        }
      } else {
        if (!gender) return;
        const { error } = await signUp(email, password, fullName, gender);
        if (error) {
          if (error.message.includes('already registered')) {
            setError(t('auth.error.alreadyRegistered'));
          } else {
            setError(error.message);
          }
        } else {
          setSuccess(t('auth.success.checkEmail'));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
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

      {/* Full Name - Signup only */}
      {mode === 'signup' && (
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-foreground font-medium">
            {t('auth.fullName')}
          </Label>
          <div className="relative">
            <User className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
            <Input
              id="fullName"
              type="text"
              placeholder={t('auth.fullNamePlaceholder')}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`${isRTL ? 'pr-11' : 'pl-11'} h-12 rounded-xl border-border bg-background`}
            />
          </div>
          {fieldErrors.fullName && (
            <p className="text-sm text-destructive">{fieldErrors.fullName}</p>
          )}
        </div>
      )}

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground font-medium">
          {t('auth.email')}
        </Label>
        <div className="relative">
          <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
          <Input
            id="email"
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${isRTL ? 'pr-11' : 'pl-11'} h-12 rounded-xl border-border bg-background`}
          />
        </div>
        {fieldErrors.email && (
          <p className="text-sm text-destructive">{fieldErrors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground font-medium">
          {t('auth.password')}
        </Label>
        <div className="relative">
          <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.passwordPlaceholder')}
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
        {fieldErrors.password && (
          <p className="text-sm text-destructive">{fieldErrors.password}</p>
        )}
      </div>

      {/* Gender - Signup only */}
      {mode === 'signup' && (
        <div className="space-y-3">
          <Label className="text-foreground font-medium">
            {t('auth.gender')} <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground">{t('auth.genderNote')}</p>
          <RadioGroup
            value={gender}
            onValueChange={(value) => setGender(value as 'male' | 'female')}
            className="flex gap-4"
          >
            <div className="flex-1">
              <RadioGroupItem
                value="male"
                id="male"
                className="peer sr-only"
              />
              <Label
                htmlFor="male"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-border bg-background cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50"
              >
                <span className="text-lg">👨</span>
                <span className="font-medium">{t('auth.male')}</span>
              </Label>
            </div>
            <div className="flex-1">
              <RadioGroupItem
                value="female"
                id="female"
                className="peer sr-only"
              />
              <Label
                htmlFor="female"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-border bg-background cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50"
              >
                <span className="text-lg">👩</span>
                <span className="font-medium">{t('auth.female')}</span>
              </Label>
            </div>
          </RadioGroup>
          {fieldErrors.gender && (
            <p className="text-sm text-destructive">{fieldErrors.gender}</p>
          )}
        </div>
      )}

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
            {mode === 'login' ? t('auth.signIn') : t('auth.createAccount')}
            <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          </>
        )}
      </Button>

      {/* Toggle Mode */}
      <p className="text-center text-muted-foreground">
        {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
        <button
          type="button"
          onClick={onToggleMode}
          className="text-primary font-semibold hover:underline"
        >
          {mode === 'login' ? t('auth.signUpLink') : t('auth.signInLink')}
        </button>
      </p>
    </form>
  );
};

export default AuthForm;
