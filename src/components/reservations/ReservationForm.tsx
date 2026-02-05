import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRoom } from '@/hooks/useRooms';
import { useCreatePayment } from '@/hooks/usePayments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Shield, CreditCard, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ReservationFormProps {
  roomId: string;
}

const ReservationForm: React.FC<ReservationFormProps> = ({ roomId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const { data: room, isLoading: roomLoading } = useRoom(roomId);
  const createPayment = useCreatePayment();

  const [checkInDate, setCheckInDate] = useState<Date>(new Date());
  const [durationMonths, setDurationMonths] = useState(1);
  
  const currency = t('reservation.currency');

  if (roomLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!room) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">{t('reservation.roomNotFound')}</p>
        </CardContent>
      </Card>
    );
  }

  const roomPrice = room.price_per_month * durationMonths;
  const insuranceAmount = room.insurance_amount || 0;
   // Platform fee is 5% of ONE month's rent only, not the total
   const platformFee = Math.round(room.price_per_month * 0.05 * 100) / 100;
  const totalAmount = roomPrice + insuranceAmount + platformFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error(t('reservation.loginRequired'));
      navigate('/auth');
      return;
    }

    try {
      await createPayment.mutateAsync({
        room_id: roomId,
        check_in_date: format(checkInDate, 'yyyy-MM-dd'),
        duration_months: durationMonths,
      });

      toast.success(t('reservation.created'));
      
      // In a real implementation, redirect to Paymob payment page
      // For now, show success and navigate to profile
      navigate('/profile');
    } catch (error: any) {
      console.error('Reservation error:', error);
      toast.error(error.message || t('reservation.failed'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <CreditCard className="w-5 h-5" />
          {t('reservation.title')}
        </CardTitle>
        <CardDescription>
          {t('reservation.subtitle')}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Room Summary */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {room.photos?.[0] && (
                <img
                  src={room.photos[0]}
                  alt={room.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div className={isRTL ? 'text-right' : ''}>
                <h3 className="font-semibold">{room.title}</h3>
                <p className={`text-sm text-muted-foreground flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <MapPin className="w-3 h-3" />
                  {room.city}
                </p>
                <p className="text-sm font-medium text-primary mt-1">
                  {currency} {room.price_per_month}/{t('reservation.month')}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('reservation.checkInDate')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start font-normal",
                      isRTL && "flex-row-reverse text-right",
                      !checkInDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {checkInDate ? format(checkInDate, "PPP") : t('reservation.selectDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align={isRTL ? "end" : "start"}>
                  <Calendar
                    mode="single"
                    selected={checkInDate}
                    onSelect={(date) => date && setCheckInDate(date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">{t('reservation.duration')}</Label>
              <Input
                id="duration"
                type="number"
                min={room.min_stay_months || 1}
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                className={isRTL ? 'text-right' : ''}
              />
              {room.min_stay_months && room.min_stay_months > 1 && (
                <p className="text-xs text-muted-foreground">
                  {t('reservation.minStay')} {room.min_stay_months} {t('reservation.months')}
                </p>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium">{t('reservation.priceBreakdown')}</h4>
            <div className="space-y-2 text-sm">
              <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{t('reservation.room')} ({durationMonths} {durationMonths > 1 ? t('reservation.months') : t('reservation.month')})</span>
                <span>{currency} {roomPrice.toLocaleString()}</span>
              </div>
              {insuranceAmount > 0 && (
                <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Shield className="w-3 h-3" />
                    {t('reservation.securityDeposit')}
                  </span>
                  <span>{currency} {insuranceAmount.toLocaleString()}</span>
                </div>
              )}
              <div className={`flex justify-between text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{t('reservation.platformFee')}</span>
                <span>{currency} {platformFee.toLocaleString()}</span>
              </div>
              <div className={`border-t pt-2 flex justify-between font-semibold ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{t('reservation.total')}</span>
                <span className="text-primary">{currency} {totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Shield className="w-5 h-5 text-primary flex-shrink-0" />
              <div className={`text-sm ${isRTL ? 'text-right' : ''}`}>
                <p className="font-medium">{t('reservation.protectedBy')}</p>
                <p className="text-muted-foreground">
                  {t('reservation.protectedDesc')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button 
            type="submit" 
            className={`w-full ${isRTL ? 'flex-row-reverse' : ''}`}
            size="lg"
            disabled={createPayment.isPending}
          >
            {createPayment.isPending ? (
              <>
                <Loader2 className={`w-4 h-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('reservation.processing')}
              </>
            ) : (
              <>
                <CreditCard className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('reservation.pay')} {currency} {totalAmount.toLocaleString()}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ReservationForm;
