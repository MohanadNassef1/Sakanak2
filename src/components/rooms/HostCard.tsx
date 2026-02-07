import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, Home, Users } from 'lucide-react';

interface HostCardProps {
  host: {
    full_name: string;
    avatar_url: string | null;
    verification_status: string;
    age?: number | null;
  };
  listerType?: 'landlord' | 'current_tenant' | null;
  className?: string;
}

const HostCard: React.FC<HostCardProps> = ({ host, listerType, className }) => {
  const { isRTL } = useLanguage();

  const isVerified = host.verification_status === 'verified';
  const isLandlord = listerType === 'landlord' || !listerType;

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-14 h-14 border-2 border-primary/20">
            <AvatarImage src={host.avatar_url || undefined} alt={host.full_name} />
            <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
              {host.full_name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold truncate">{host.full_name}</h3>
              {isVerified && (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}
            </div>

            {host.age && (
              <p className="text-sm text-muted-foreground">
                {host.age} {isRTL ? 'سنة' : 'years old'}
              </p>
            )}

            <div className="flex items-center gap-2 mt-1.5">
              <Badge
                variant="secondary"
                className={
                  isLandlord
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                    : 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30'
                }
              >
                {isLandlord ? (
                  <>
                    <Home className="w-3 h-3 mr-1" />
                    {isRTL ? 'مالك' : 'Landlord'}
                  </>
                ) : (
                  <>
                    <Users className="w-3 h-3 mr-1" />
                    {isRTL ? 'مستأجر حالي' : 'Current Tenant'}
                  </>
                )}
              </Badge>

              {isVerified && (
                <Badge variant="outline" className="text-xs border-green-500/50 text-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {isRTL ? 'موثق' : 'Verified'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HostCard;
