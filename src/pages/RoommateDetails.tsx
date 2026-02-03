import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRoommateProfile } from '@/hooks/useRoommates';
import { useStartConversation } from '@/hooks/useConversations';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  User,
  Briefcase,
  Cigarette,
  PawPrint,
  CheckCircle,
  MessageCircle,
  Globe,
  ArrowLeft,
  Loader2,
  Calendar,
} from 'lucide-react';

const RoommateDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const startConversation = useStartConversation();

  const { data: roommate, isLoading, error } = useRoommateProfile(id);

  const handleMessage = async () => {
    if (!user) {
      toast.error(language === 'ar' ? 'يرجى تسجيل الدخول للمراسلة' : 'Please sign in to message');
      navigate('/auth');
      return;
    }

    if (!roommate) return;

    try {
      const conv = await startConversation.mutateAsync({
        otherUserId: roommate.user_id,
      });
      navigate(`/messages?conversation=${conv.id}`);
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل بدء المحادثة. يرجى التحقق من حسابك.' : 'Failed to start conversation. Please verify your account.');
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-64 rounded-2xl mb-6" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !roommate) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="text-2xl font-bold mb-4">{t('roommates.notFound')}</h1>
            <p className="text-muted-foreground mb-6">
              {t('roommates.notFoundDesc')}
            </p>
            <Button onClick={() => navigate('/roommates')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('roommates.back')}
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const joinDate = new Date(roommate.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <MainLayout>
      <div className="min-h-screen bg-background pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/roommates')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('roommates.back')}
          </Button>

          {/* Profile Header */}
          <Card className="overflow-hidden mb-6">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar */}
                <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center text-4xl font-bold text-primary overflow-hidden shrink-0">
                  {roommate.avatar_url ? (
                    <img
                      src={roommate.avatar_url}
                      alt={roommate.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    roommate.full_name.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                    <h1 className="text-3xl font-bold">{roommate.full_name}</h1>
                    {roommate.verification_status === 'verified' && (
                      <Badge className="bg-primary text-primary-foreground gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {t('profile.verified')}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground mb-4">
                    {roommate.occupation && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        {roommate.occupation}
                      </span>
                    )}
                    {roommate.nationality && (
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-4 h-4" />
                        {roommate.nationality}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {t('roommates.memberSince')} {joinDate}
                    </span>
                  </div>

                  {/* Lifestyle Badges */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <Badge variant="outline" className="gap-1">
                      <User className="w-3 h-3" />
                      {roommate.gender === 'male' ? t('auth.male') : t('auth.female')}
                    </Badge>
                    <Badge
                      variant={roommate.is_smoker ? 'destructive' : 'secondary'}
                      className="gap-1"
                    >
                      <Cigarette className="w-3 h-3" />
                      {roommate.is_smoker ? t('roommates.smoker') : t('roommates.nonSmoker')}
                    </Badge>
                    {roommate.has_pets && (
                      <Badge variant="secondary" className="gap-1">
                        <PawPrint className="w-3 h-3" />
                        {roommate.pet_type || t('roommates.hasPets')}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Message Button */}
                <Button
                  size="lg"
                  className="gap-2 shrink-0"
                  onClick={handleMessage}
                  disabled={startConversation.isPending || roommate.user_id === user?.id}
                >
                  {startConversation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4" />
                      {t('roommates.sendMessage')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* About Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roommate.about && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-3">{t('roommates.about')}</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {roommate.about}
                  </p>
                </CardContent>
              </Card>
            )}

            {roommate.looking_for && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-3">{t('roommates.lookingFor')}</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {roommate.looking_for}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* CTA Section */}
          {!user && (
            <Card className="mt-6 bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">{t('roommates.interestedConnect')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('roommates.signInToMessage')}
                </p>
                <Button onClick={() => navigate('/auth')}>{t('nav.signIn')}</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default RoommateDetails;
