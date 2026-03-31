import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Home, Search, X } from 'lucide-react';
import { trackCustomEvent } from '@/lib/fbPixel';

interface IntentSelectionDialogProps {
  open: boolean;
  onClose: () => void;
}

const IntentSelectionDialog: React.FC<IntentSelectionDialogProps> = ({ open, onClose }) => {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const handleSelectIntent = (intent: 'find' | 'list') => {
    trackCustomEvent(intent === 'find' ? 'ClickFindRoom' : 'ClickListRoom', { source: 'intent_dialog' });
    onClose();
    if (intent === 'find') {
      navigate('/rooms');
    } else {
      navigate('/list-room');
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md [&>button.absolute]:hidden" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">
            {isRTL ? 'مرحباً بك في سكنك!' : 'Welcome to Sakanak!'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isRTL 
              ? 'ماذا تريد أن تفعل اليوم؟' 
              : 'What would you like to do today?'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Find a Place Option */}
          <Button
            variant="outline"
            className="h-auto p-6 flex flex-col items-center gap-3 hover:border-primary hover:bg-primary/5 transition-all"
            onClick={() => handleSelectIntent('find')}
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Search className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">
                {isRTL ? 'أبحث عن سكن' : 'Find a Place'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isRTL 
                  ? 'تصفح الأماكن المتاحة وابحث عن مكانك المثالي' 
                  : 'Browse available places and find your perfect match'}
              </p>
            </div>
          </Button>

          {/* List a Place Option */}
          <Button
            variant="outline"
            className="h-auto p-6 flex flex-col items-center gap-3 hover:border-primary hover:bg-primary/5 transition-all"
            onClick={() => handleSelectIntent('list')}
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Home className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">
                {isRTL ? 'لدي سكن للإيجار' : 'List a Place'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isRTL 
                  ? 'اعرض سكنك واعثر على شريك سكن مناسب' 
                  : 'Post your place and find the perfect roommate'}
              </p>
            </div>
          </Button>
        </div>

        {/* Skip Button */}
        <Button 
          variant="ghost" 
          className="w-full text-muted-foreground"
          onClick={onClose}
        >
          {isRTL ? 'تخطي' : 'Skip for now'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default IntentSelectionDialog;
