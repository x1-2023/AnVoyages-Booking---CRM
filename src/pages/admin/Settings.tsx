import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { CreditCard, KeyRound, Link2, Upload } from 'lucide-react';
import AdminPage from '@/components/admin/AdminPage';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { settingsService } from '@/services/settings.service';
import { mediaService } from '@/services/media.service';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const getErrorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;

const sepayDefaults = {
  sepay_enabled: 'false',
  sepay_env: 'sandbox',
  sepay_payment_method: 'BANK_TRANSFER',
  sepay_currency: 'VND',
  sepay_order_prefix: 'AV',
  sepay_deposit_percent: '50',
  sepay_transfer_template: '{bookingCode} {customerName} {phoneLast4}',
  currency_rate_vnd: '1',
  currency_rate_usd: '25500',
  currency_rate_gbp: '32000',
  currency_rate_eur: '27500',
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const { toast } = useToast();
  const { refreshSettings } = useSettings();

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await settingsService.getAdminAll();
      setSettings({ ...sepayDefaults, ...data });
    } catch (error) {
      toast({ title: 'Lỗi', description: getErrorMessage(error, 'Không thể tải cài đặt'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleInitialize = async () => {
    try {
      setSaving(true);
      const data = await settingsService.initializeDefaults();
      setSettings({ ...sepayDefaults, ...data });
      await refreshSettings();
      toast({ title: 'Thành công', description: 'Đã khởi tạo cài đặt mặc định' });
    } catch (error) {
      toast({ title: 'Lỗi', description: getErrorMessage(error, 'Không thể khởi tạo cài đặt'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsService.updateMultiple(settings);
      await refreshSettings();
      toast({ title: 'Thành công', description: 'Đã lưu cài đặt và áp dụng ra hệ thống.' });
    } catch (error) {
      toast({ title: 'Lỗi', description: getErrorMessage(error, 'Không thể lưu cài đặt'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleHeroUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      setUploadingHero(true);
      const uploaded = await mediaService.uploadHeroImage(file);
      handleChange('hero_background_image', uploaded.url);
      toast({ title: 'Thành công', description: 'Ảnh hero đã upload. Hãy lưu để áp dụng toàn site.' });
    } catch (error) {
      toast({ title: 'Lỗi', description: getErrorMessage(error, 'Không thể upload ảnh hero'), variant: 'destructive' });
    } finally {
      setUploadingHero(false);
    }
  };

  if (loading) {
    return (
      <AdminPage>
        <AdminPageHeader title="Cài đặt" description="Quản lý website, thương hiệu, liên hệ và thanh toán." />
        <div className="flex h-64 items-center justify-center rounded-3xl border bg-card/80 shadow-sm">
          <p className="text-muted-foreground">Đang tải cài đặt...</p>
        </div>
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Cài đặt"
        description="Quản lý nội dung website, thông tin liên hệ và cấu hình thanh toán Sepay."
        actions={
          <>
            <Button variant="outline" className="rounded-xl" onClick={handleInitialize} disabled={saving}>
              Khởi tạo mặc định
            </Button>
            <Button className="rounded-xl bg-gradient-cta shadow-accent" onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
          <Card className="rounded-3xl bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle>Thông tin website</CardTitle>
              <CardDescription>Tên thương hiệu, tagline và thông tin liên hệ hiển thị cho khách.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="site_name">Tên website</Label>
                <Input id="site_name" value={settings.site_name || ''} onChange={(e) => handleChange('site_name', e.target.value)} placeholder="An Voyages" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site_tagline">Tagline</Label>
                <Input id="site_tagline" value={settings.site_tagline || ''} onChange={(e) => handleChange('site_tagline', e.target.value)} placeholder="Tour Cát Bà, Hạ Long, Cô Tô, Quan Lạn" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Email liên hệ</Label>
                <Input id="contact_email" type="email" value={settings.contact_email || ''} onChange={(e) => handleChange('contact_email', e.target.value)} placeholder="contact@anvoyages.vn" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Số điện thoại</Label>
                <Input id="contact_phone" value={settings.contact_phone || ''} onChange={(e) => handleChange('contact_phone', e.target.value)} placeholder="+84 123 456 789" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle>Hero homepage</CardTitle>
              <CardDescription>Upload ảnh nội bộ hoặc dán CDN URL ngoài cho phần hero.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="hero_background_image">Hero background image URL</Label>
                  <label>
                    <input type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} disabled={uploadingHero} />
                    <Button type="button" variant="outline" size="sm" className="rounded-xl" disabled={uploadingHero} asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        {uploadingHero ? 'Đang upload...' : 'Upload ảnh'}
                      </span>
                    </Button>
                  </label>
                </div>
                <Input id="hero_background_image" value={settings.hero_background_image || ''} onChange={(e) => handleChange('hero_background_image', e.target.value)} placeholder="https://example.com/hero-bg.jpg" />
                {settings.hero_background_image && (
                  <div className="mt-3 overflow-hidden rounded-2xl border">
                    <img src={settings.hero_background_image} alt="Hero preview" className="max-h-72 w-full object-cover" />
                  </div>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hero_title">Hero title</Label>
                  <Input id="hero_title" value={settings.hero_title || ''} onChange={(e) => handleChange('hero_title', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero_subtitle">Hero subtitle</Label>
                  <Input id="hero_subtitle" value={settings.hero_subtitle || ''} onChange={(e) => handleChange('hero_subtitle', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle>Tỷ giá hiển thị</CardTitle>
              <CardDescription>Giá gốc vẫn nhập bằng VND trong admin. Website dùng tỷ giá này để hiển thị USD, GBP, EUR cho khách quốc tế.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="currency_rate_vnd">VND</Label>
                <Input id="currency_rate_vnd" type="number" min="1" value={settings.currency_rate_vnd || '1'} onChange={(e) => handleChange('currency_rate_vnd', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency_rate_usd">1 USD = VND</Label>
                <Input id="currency_rate_usd" type="number" min="1" value={settings.currency_rate_usd || '25500'} onChange={(e) => handleChange('currency_rate_usd', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency_rate_gbp">1 GBP = VND</Label>
                <Input id="currency_rate_gbp" type="number" min="1" value={settings.currency_rate_gbp || '32000'} onChange={(e) => handleChange('currency_rate_gbp', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency_rate_eur">1 EUR = VND</Label>
                <Input id="currency_rate_eur" type="number" min="1" value={settings.currency_rate_eur || '27500'} onChange={(e) => handleChange('currency_rate_eur', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-primary/25 bg-card/95 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Sepay payment gateway</CardTitle>
                  <CardDescription>Cấu hình SDK NodeJS, mã booking, checkout và IPN.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Trạng thái</Label>
                  <Select value={settings.sepay_enabled || 'false'} onValueChange={(value) => handleChange('sepay_enabled', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Tắt</SelectItem>
                      <SelectItem value="true">Bật</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Môi trường</Label>
                  <Select value={settings.sepay_env || 'sandbox'} onValueChange={(value) => handleChange('sepay_env', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Phương thức</Label>
                  <Select value={settings.sepay_payment_method || 'BANK_TRANSFER'} onValueChange={(value) => handleChange('sepay_payment_method', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BANK_TRANSFER">QR ngân hàng</SelectItem>
                      <SelectItem value="NAPAS_BANK_TRANSFER">QR Napas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sepay_merchant_id">Merchant ID</Label>
                  <Input id="sepay_merchant_id" value={settings.sepay_merchant_id || ''} onChange={(e) => handleChange('sepay_merchant_id', e.target.value)} placeholder="YOUR_MERCHANT_ID" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sepay_secret_key">Merchant secret key</Label>
                  <Input id="sepay_secret_key" type="password" value={settings.sepay_secret_key || ''} onChange={(e) => handleChange('sepay_secret_key', e.target.value)} placeholder="YOUR_MERCHANT_SECRET_KEY" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sepay_ipn_secret_key">IPN secret key</Label>
                  <Input id="sepay_ipn_secret_key" type="password" value={settings.sepay_ipn_secret_key || ''} onChange={(e) => handleChange('sepay_ipn_secret_key', e.target.value)} placeholder="Nếu để trống sẽ dùng merchant secret key" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sepay_currency">Currency</Label>
                  <Input id="sepay_currency" value={settings.sepay_currency || 'VND'} onChange={(e) => handleChange('sepay_currency', e.target.value.toUpperCase())} placeholder="VND" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="sepay_order_prefix">Prefix mã booking</Label>
                  <Input id="sepay_order_prefix" value={settings.sepay_order_prefix || 'AV'} onChange={(e) => handleChange('sepay_order_prefix', e.target.value)} placeholder="AV" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sepay_deposit_percent">Cọc mặc định (%)</Label>
                  <Input id="sepay_deposit_percent" type="number" min="0" max="100" value={settings.sepay_deposit_percent || '50'} onChange={(e) => handleChange('sepay_deposit_percent', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sepay_transfer_template">Nội dung chuyển khoản</Label>
                  <Input id="sepay_transfer_template" value={settings.sepay_transfer_template || ''} onChange={(e) => handleChange('sepay_transfer_template', e.target.value)} placeholder="{bookingCode} {customerName} {phoneLast4}" />
                </div>
              </div>

              <div className="rounded-2xl border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
                Biến hỗ trợ cho mã/nội dung: <code>{'{bookingCode}'}</code>, <code>{'{customerName}'}</code>, <code>{'{phoneLast4}'}</code>, <code>{'{phone}'}</code>.
                Booking mới sẽ dùng prefix để tạo mã dạng <strong>AV-20260502-001</strong>.
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="sepay_success_url">Success URL</Label>
                  <Input id="sepay_success_url" value={settings.sepay_success_url || ''} onChange={(e) => handleChange('sepay_success_url', e.target.value)} placeholder="https://domain.vn/payment/success/{bookingCode}" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sepay_error_url">Error URL</Label>
                  <Input id="sepay_error_url" value={settings.sepay_error_url || ''} onChange={(e) => handleChange('sepay_error_url', e.target.value)} placeholder="https://domain.vn/payment/error/{bookingCode}" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sepay_cancel_url">Cancel URL</Label>
                  <Input id="sepay_cancel_url" value={settings.sepay_cancel_url || ''} onChange={(e) => handleChange('sepay_cancel_url', e.target.value)} placeholder="https://domain.vn/payment/cancel/{bookingCode}" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="rounded-3xl bg-card/90 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Ghi chú bảo mật</CardTitle>
                  <CardDescription>Secret key không trả về public settings.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>Frontend public chỉ thấy cấu hình không nhạy cảm. Merchant secret và IPN secret chỉ đọc ở admin/backend.</p>
              <p>Trên SePay, cấu hình IPN URL trỏ tới backend public HTTPS:</p>
              <code className="block rounded-2xl bg-muted p-3 text-xs text-foreground">https://your-domain.vn/api/bookings/sepay/ipn?secret=YOUR_IPN_SECRET</code>
              <p>Nếu test local, dùng Cloudflare Tunnel/ngrok rồi thay domain tunnel vào URL trên. Không dùng trực tiếp localhost vì SePay không gọi được máy local.</p>
              <p>IPN phải chạy HTTPS ở production và trả HTTP 200 khi nhận thành công.</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl bg-card/90 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Link2 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Callback variables</CardTitle>
                  <CardDescription>Dùng trong success/error/cancel URL.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                readOnly
                className="min-h-40 resize-none rounded-2xl bg-muted/40 text-sm"
                value={[
                  '{bookingId} - ID nội bộ',
                  '{bookingCode} - mã booking',
                  '{paymentReference} - mã invoice gửi sang Sepay',
                  '',
                  'SDK dùng:',
                  'operation = PURCHASE',
                  'payment_method = BANK_TRANSFER hoặc NAPAS_BANK_TRANSFER',
                  'currency = VND mặc định',
                ].join('\n')}
              />
            </CardContent>
          </Card>

          <Card className="rounded-3xl bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle>Màu & footer</CardTitle>
              <CardDescription>Cấu hình giao diện cơ bản.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primary_color">Primary color</Label>
                <div className="flex gap-2">
                  <Input id="primary_color" value={settings.primary_color || ''} onChange={(e) => handleChange('primary_color', e.target.value)} placeholder="#3B82F6" />
                  <input type="color" value={settings.primary_color || '#3B82F6'} onChange={(e) => handleChange('primary_color', e.target.value)} className="h-10 w-16 cursor-pointer rounded-xl border" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary_color">Secondary color</Label>
                <div className="flex gap-2">
                  <Input id="secondary_color" value={settings.secondary_color || ''} onChange={(e) => handleChange('secondary_color', e.target.value)} placeholder="#10B981" />
                  <input type="color" value={settings.secondary_color || '#10B981'} onChange={(e) => handleChange('secondary_color', e.target.value)} className="h-10 w-16 cursor-pointer rounded-xl border" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="footer_text">Footer text</Label>
                <Input id="footer_text" value={settings.footer_text || ''} onChange={(e) => handleChange('footer_text', e.target.value)} placeholder="© 2026 An Voyages. All rights reserved." />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg" className="rounded-xl bg-gradient-cta shadow-accent">
          {saving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
        </Button>
      </div>
    </AdminPage>
  );
}
