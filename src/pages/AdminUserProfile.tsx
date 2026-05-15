import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useAdminActions";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AvatarLightbox from "@/components/AvatarLightbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ShieldAlert,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Share2,
} from "lucide-react";

type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export default function AdminUserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin(user?.id);
  const queryClient = useQueryClient();
  const [updatingGender, setUpdatingGender] = useState(false);

  const handleGenderChange = async (newGender: string) => {
    if (!userId) return;
    setUpdatingGender(true);
    const { error } = await supabase
      .from("profiles")
      .update({ gender: newGender as "male" | "female" })
      .eq("user_id", userId);
    setUpdatingGender(false);
    if (error) {
      toast.error(error.message || "Failed to update gender");
      return;
    }
    toast.success("Gender updated");
    queryClient.invalidateQueries({ queryKey: ["admin-user-profile", userId] });
  };

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["admin-user-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!isAdmin && !!userId,
  });

  // Fetch referrer name
  const { data: referrer } = useQuery({
    queryKey: ["referrer", profile?.referred_by],
    queryFn: async () => {
      if (!profile?.referred_by) return null;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, user_id")
        .eq("referral_code", profile.referred_by)
        .single();
      return data;
    },
    enabled: !!profile?.referred_by,
  });

  // Redirect non-admins
  if (!isAdminLoading && !isAdmin) {
    return (
      <MainLayout>
        <div className="container mx-auto py-16 text-center">
          <ShieldAlert className="h-16 w-16 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to view this page.
          </p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Go Home
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (isLoading || isAdminLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="container mx-auto py-16 text-center">
          <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
          <Button onClick={() => navigate("/admin/users")} className="mt-4">
            Back to Users
          </Button>
        </div>
      </MainLayout>
    );
  }

  const getStatusBadge = (status: VerificationStatus | null) => {
    switch (status) {
      case "verified":
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-3 w-3 mr-1" /> Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-accent text-accent-foreground">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">Unverified</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/users")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <AvatarLightbox src={profile.avatar_url} alt={profile.full_name || ''}>
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar_url || ""} />
                  <AvatarFallback className="text-2xl">
                    {profile.full_name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
              </AvatarLightbox>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
                  {getStatusBadge(profile.verification_status as VerificationStatus)}
                  <Select
                    value={profile.gender || undefined}
                    onValueChange={handleGenderChange}
                    disabled={updatingGender}
                  >
                    <SelectTrigger className="h-7 w-32 capitalize">
                      <SelectValue placeholder="Set gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  {profile.occupation && (
                    <Badge variant="outline">{profile.occupation}</Badge>
                  )}
                  {profile.occupation && (
                    <Badge variant="outline">{profile.occupation}</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{profile.phone || "Not provided"}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Referral Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Share2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Referral Code</p>
                  <p className="font-medium font-mono">
                    {profile.referral_code || "Not generated"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Referred By</p>
                  <p className="font-medium">
                    {referrer ? (
                      <Button
                        variant="link"
                        className="h-auto p-0"
                        onClick={() => navigate(`/admin/user/${referrer.user_id}`)}
                      >
                        {referrer.full_name}
                      </Button>
                    ) : profile.referred_by ? (
                      profile.referred_by
                    ) : (
                      "Direct signup"
                    )}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Referrals Made</p>
                  <p className="font-medium">{profile.referral_count || 0} users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Personal Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-medium">{profile.age || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nationality</p>
                    <p className="font-medium">{profile.nationality || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Job Title</p>
                    <p className="font-medium">{profile.job_title || "Not provided"}</p>
                  </div>
                </div>
              </div>

              {profile.about && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">About</p>
                    <p className="text-sm">{profile.about}</p>
                  </div>
                </>
              )}

              {profile.looking_for && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Looking For</p>
                    <p className="text-sm">{profile.looking_for}</p>
                  </div>
                </>
              )}

              {profile.personality_tags && profile.personality_tags.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Personality Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.personality_tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
