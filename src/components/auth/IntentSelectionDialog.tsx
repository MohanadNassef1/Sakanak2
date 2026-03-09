import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowRight, ArrowLeft, Sparkles, Shield, Users } from 'lucide-react';

interface IntentSelectionDialogProps {
  open: boolean;
  onClose: () => void;
}

const IntentSelectionDialog: React.FC<IntentSelectionDialogProps> = ({ open, onClose }) => {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<'find' | 'list' | null>(null);

  const handleSelectIntent = (intent: 'find' | 'list') => {
    onClose();
    if (intent === 'find') {
      navigate('/rooms');
    } else {
      navigate('/list-room');
    }
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-lg p-0 overflow-hidden border-0 shadow-2xl [&>button.absolute]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 px-8 pt-8 pb-10 text-center">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-8 w-16 h-16 rounded-full border-2 border-primary-foreground/30" />
            <div className="absolute bottom-6 right-10 w-10 h-10 rounded-full border-2 border-primary-foreground/20" />
            <div className="absolute top-8 right-20 w-6 h-6 rounded-full bg-primary-foreground/20" />
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-primary-foreground/20 backdrop-blur-sm rounded-full px-3 py-1 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
              <span className="text-xs font-medium text-primary-foreground">
                {isRTL ? 'مرحباً بك!' : 'Welcome aboard!'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-primary-foreground mb-2">
              {isRTL ? 'أهلاً بك في سكنك! 🎉' : 'Welcome to Sakanak! 🎉'}
            </h2>
            <p className="text-primary-foreground/80 text-sm">
              {isRTL
                ? 'اختر ما يناسبك وابدأ رحلتك معنا'
                : 'Choose your path and get started'}
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="px-6 -mt-6 space-y-3 relative z-10">
          {/* Find a Room Card */}
          <button
            onClick={() => handleSelectIntent('find')}
            onMouseEnter={() => setHoveredCard('find')}
            onMouseLeave={() => setHoveredCard(null)}
            className={`w-full text-${isRTL ? 'right' : 'left'} rounded-xl border-2 p-5 transition-all duration-300 bg-card shadow-md group
              ${hoveredCard === 'find'
                ? 'border-primary shadow-lg shadow-primary/10 scale-[1.02]'
                : 'border-border hover:border-primary/50'
              }`}
          >
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300
                ${hoveredCard === 'find'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'bg-primary/10 text-primary'
                }`}>
                <Search className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h3 className="font-bold text-lg text-foreground">
                    {isRTL ? 'أبحث عن غرفة' : 'Find a Room'}
                  </h3>
                  <ArrowIcon className={`w-4 h-4 text-primary transition-transform duration-300 ${
                    hoveredCard === 'find' ? (isRTL ? '-translate-x-1' : 'translate-x-1') : 'opacity-0'
                  }`} />
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {isRTL
                    ? 'تصفح الغرف المتاحة وابحث عن مكانك المثالي'
                    : 'Browse available rooms and find your perfect place'}
                </p>
                <div className={`flex items-center gap-3 mt-2.5 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`inline-flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Shield className="w-3 h-3 text-primary" />
                    {isRTL ? 'مُعتمدين' : 'Verified hosts'}
                  </span>
                  <span className={`inline-flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Users className="w-3 h-3 text-primary" />
                    {isRTL ? 'تطابق ذكي' : 'Smart matching'}
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 px-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-medium text-muted-foreground">
              {isRTL ? 'أو' : 'or'}
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* List a Room Card */}
          <button
            onClick={() => handleSelectIntent('list')}
            onMouseEnter={() => setHoveredCard('list')}
            onMouseLeave={() => setHoveredCard(null)}
            className={`w-full text-${isRTL ? 'right' : 'left'} rounded-xl border-2 p-5 transition-all duration-300 bg-card shadow-md group
              ${hoveredCard === 'list'
                ? 'border-primary shadow-lg shadow-primary/10 scale-[1.02]'
                : 'border-border hover:border-primary/50'
              }`}
          >
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300
                ${hoveredCard === 'list'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'bg-primary/10 text-primary'
                }`}>
                <Home className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h3 className="font-bold text-lg text-foreground">
                    {isRTL ? 'لدي غرفة للإيجار' : 'List a Room'}
                  </h3>
                  <ArrowIcon className={`w-4 h-4 text-primary transition-transform duration-300 ${
                    hoveredCard === 'list' ? (isRTL ? '-translate-x-1' : 'translate-x-1') : 'opacity-0'
                  }`} />
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {isRTL
                    ? 'اعرض غرفتك واعثر على شريك سكن مناسب'
                    : 'Post your room and find the perfect roommate'}
                </p>
                <div className={`flex items-center gap-3 mt-2.5 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`inline-flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Sparkles className="w-3 h-3 text-primary" />
                    {isRTL ? 'مجاناً' : 'Free listing'}
                  </span>
                  <span className={`inline-flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Shield className="w-3 h-3 text-primary" />
                    {isRTL ? 'مستأجرين موثوقين' : 'Verified tenants'}
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4">
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground text-sm"
            onClick={onClose}
          >
            {isRTL ? 'تخطي الآن — يمكنك الاختيار لاحقاً' : 'Skip for now — you can choose later'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IntentSelectionDialog;
