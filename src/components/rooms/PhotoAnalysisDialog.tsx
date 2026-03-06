import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, CheckCircle, XCircle, Wifi, Wind, Flame, Building2, DoorOpen, Shield, Droplets } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AnalysisResult {
  has_ac: boolean;
  has_wifi: boolean;
  has_balcony: boolean;
  has_elevator: boolean;
  has_water_heater: boolean;
  has_natural_gas: boolean;
  has_private_bathroom: boolean;
  has_doorman: boolean;
  suggested_room_type?: string;
  estimated_bedrooms?: number;
  confidence_notes: string[];
}

interface AmenityItem {
  key: string;
  formKey: string;
  labelEn: string;
  labelAr: string;
  icon: React.ElementType;
  detected: boolean;
}

interface PhotoAnalysisDialogProps {
  photos: string[];
  onApply: (updates: Record<string, any>) => void;
}

const PhotoAnalysisDialog: React.FC<PhotoAnalysisDialogProps> = ({ photos, onApply }) => {
  const { isRTL, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const analyze = async () => {
    if (photos.length === 0) {
      toast.error(isRTL ? 'ارفع صور الغرفة أولاً' : 'Upload room photos first');
      return;
    }

    setOpen(true);
    setLoading(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-room-photos', {
        body: { photoUrls: photos },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const result = data.analysis as AnalysisResult;
      setAnalysis(result);

      // Pre-select all detected amenities
      const preSelected: Record<string, boolean> = {};
      for (const key of ['has_ac', 'has_wifi', 'has_balcony', 'has_elevator', 'has_water_heater', 'has_natural_gas', 'has_private_bathroom', 'has_doorman']) {
        if ((result as any)[key]) preSelected[key] = true;
      }
      if (result.suggested_room_type) preSelected['room_type'] = true;
      if (result.estimated_bedrooms) preSelected['total_bedrooms'] = true;
      setSelected(preSelected);
    } catch (err: any) {
      console.error('Photo analysis error:', err);
      toast.error(isRTL ? 'فشل تحليل الصور' : 'Photo analysis failed');
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!analysis) return;
    const updates: Record<string, any> = {};
    for (const key of ['has_ac', 'has_wifi', 'has_balcony', 'has_elevator', 'has_water_heater', 'has_natural_gas', 'has_private_bathroom', 'has_doorman']) {
      if (selected[key]) updates[key] = true;
    }
    if (selected['room_type'] && analysis.suggested_room_type) {
      updates['room_type'] = analysis.suggested_room_type;
    }
    if (selected['total_bedrooms'] && analysis.estimated_bedrooms) {
      updates['total_bedrooms'] = analysis.estimated_bedrooms;
    }
    onApply(updates);
    setOpen(false);
    toast.success(isRTL ? 'تم تطبيق الاقتراحات!' : 'Suggestions applied!');
  };

  const toggleSelect = (key: string) => {
    setSelected(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const amenityItems: AmenityItem[] = analysis ? [
    { key: 'has_ac', formKey: 'has_ac', labelEn: 'Air Conditioning', labelAr: 'تكييف', icon: Wind, detected: analysis.has_ac },
    { key: 'has_wifi', formKey: 'has_wifi', labelEn: 'WiFi', labelAr: 'واي فاي', icon: Wifi, detected: analysis.has_wifi },
    { key: 'has_balcony', formKey: 'has_balcony', labelEn: 'Balcony', labelAr: 'بلكونة', icon: DoorOpen, detected: analysis.has_balcony },
    { key: 'has_elevator', formKey: 'has_elevator', labelEn: 'Elevator', labelAr: 'أسانسير', icon: Building2, detected: analysis.has_elevator },
    { key: 'has_water_heater', formKey: 'has_water_heater', labelEn: 'Water Heater', labelAr: 'سخان مياه', icon: Droplets, detected: analysis.has_water_heater },
    { key: 'has_natural_gas', formKey: 'has_natural_gas', labelEn: 'Natural Gas', labelAr: 'غاز طبيعي', icon: Flame, detected: analysis.has_natural_gas },
    { key: 'has_private_bathroom', formKey: 'has_private_bathroom', labelEn: 'Private Bathroom', labelAr: 'حمام خاص', icon: DoorOpen, detected: analysis.has_private_bathroom },
    { key: 'has_doorman', formKey: 'has_doorman', labelEn: 'Doorman', labelAr: 'بواب', icon: Shield, detected: analysis.has_doorman },
  ] : [];

  const detectedCount = amenityItems.filter(a => a.detected).length;

  const ROOM_TYPE_LABELS: Record<string, { en: string; ar: string }> = {
    private_room: { en: 'Private Room', ar: 'غرفة خاصة' },
    shared_room: { en: 'Shared Room', ar: 'غرفة مشتركة' },
    studio: { en: 'Studio', ar: 'استوديو' },
    apartment: { en: 'Apartment', ar: 'شقة' },
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={analyze}
        disabled={photos.length === 0}
        className="gap-2"
      >
        <Sparkles className="w-4 h-4 text-primary" />
        {isRTL ? 'تحليل ذكي للصور' : 'Smart Photo Analysis'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={cn("max-w-lg", isRTL && "rtl")}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {isRTL ? 'تحليل ذكي للصور' : 'Smart Photo Analysis'}
            </DialogTitle>
            <DialogDescription>
              {isRTL
                ? 'تم تحليل الصور بالذكاء الاصطناعي. اختر ما تريد تطبيقه.'
                : 'AI analyzed your photos. Select what to apply.'}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'جاري تحليل الصور...' : 'Analyzing photos...'}
              </p>
            </div>
          ) : analysis ? (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Detected amenities */}
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {isRTL ? `تم اكتشاف ${detectedCount} مرافق` : `${detectedCount} amenities detected`}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {amenityItems.map((item) => (
                    <div
                      key={item.key}
                      onClick={() => item.detected && toggleSelect(item.key)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-colors",
                        item.detected
                          ? selected[item.key]
                            ? "border-primary bg-primary/5 cursor-pointer"
                            : "border-muted cursor-pointer hover:border-primary/50"
                          : "border-muted/50 opacity-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{language === 'ar' ? item.labelAr : item.labelEn}</span>
                      </div>
                      {item.detected ? (
                        selected[item.key] ? (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                        )
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground/50" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Room type suggestion */}
              {analysis.suggested_room_type && (
                <div
                  onClick={() => toggleSelect('room_type')}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                    selected['room_type']
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {isRTL ? 'نوع السكن المقترح:' : 'Suggested type:'}
                    </span>
                    <Badge variant="secondary">
                      {language === 'ar'
                        ? ROOM_TYPE_LABELS[analysis.suggested_room_type]?.ar
                        : ROOM_TYPE_LABELS[analysis.suggested_room_type]?.en}
                    </Badge>
                  </div>
                  {selected['room_type'] ? (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </div>
              )}

              {/* Bedrooms estimate */}
              {analysis.estimated_bedrooms && (
                <div
                  onClick={() => toggleSelect('total_bedrooms')}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                    selected['total_bedrooms']
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {isRTL ? 'عدد الغرف المقدر:' : 'Estimated bedrooms:'}
                    </span>
                    <Badge variant="secondary">{analysis.estimated_bedrooms}</Badge>
                  </div>
                  {selected['total_bedrooms'] ? (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </div>
              )}

              {/* Confidence notes */}
              {analysis.confidence_notes?.length > 0 && (
                <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    {isRTL ? 'ملاحظات التحليل:' : 'Analysis notes:'}
                  </p>
                  {analysis.confidence_notes.map((note, i) => (
                    <p key={i} className="text-xs text-muted-foreground">• {note}</p>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {analysis && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handleApply} disabled={Object.values(selected).filter(Boolean).length === 0}>
                <CheckCircle className="w-4 h-4 mr-2" />
                {isRTL ? 'تطبيق المحدد' : 'Apply Selected'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotoAnalysisDialog;
