import { useCallback, useEffect, useState } from 'react';
import { Bot, CheckCircle2, Facebook, Instagram, MessageCircle, Plus, RadioTower, WalletCards } from 'lucide-react';
import AdminPage from '@/components/admin/AdminPage';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AutomationRule, IntegrationChannel, integrationService } from '@/services/integration.service';

const iconMap: Record<string, React.ElementType> = {
  facebook: Facebook,
  instagram: Instagram,
  zalo: MessageCircle,
  tiktok: RadioTower,
  sepay: WalletCards,
};

const statusLabel: Record<string, string> = {
  not_connected: 'Chưa kết nối',
  connected: 'Đã kết nối',
  paused: 'Tạm dừng',
  error: 'Lỗi',
};

export default function Integrations() {
  const { toast } = useToast();
  const [channels, setChannels] = useState<IntegrationChannel[]>([]);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    channelId: '',
    name: '',
    trigger: 'new_lead',
    action: 'create_lead',
    template: '',
  });

  const loadData = useCallback(async () => {
    const [channelData, ruleData] = await Promise.all([
      integrationService.channels(),
      integrationService.rules(),
    ]);
    setChannels(channelData);
    setRules(ruleData);
  }, []);

  useEffect(() => {
    loadData().catch((error) => toast({
      title: 'Không tải được tích hợp',
      description: error instanceof Error ? error.message : 'Vui lòng thử lại',
      variant: 'destructive',
    }));
  }, [loadData, toast]);

  const createRule = async () => {
    await integrationService.createRule({
      ...form,
      channelId: form.channelId || undefined,
      isActive: true,
    });
    setOpen(false);
    setForm({ channelId: '', name: '', trigger: 'new_lead', action: 'create_lead', template: '' });
    await loadData();
  };

  const toggleRule = async (rule: AutomationRule) => {
    await integrationService.updateRule(rule.id, { isActive: !rule.isActive });
    await loadData();
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title="Tích hợp & Automation"
        description="Chuẩn bị kênh Facebook, Instagram, Zalo, TikTok và Sepay. Hiện tại là nền tảng cấu hình, chưa kết nối token thật."
        actions={(
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Thêm rule</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Thêm automation rule</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <Input placeholder="Tên rule" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Select value={form.channelId || 'all'} onValueChange={(value) => setForm({ ...form, channelId: value === 'all' ? '' : value })}>
                  <SelectTrigger><SelectValue placeholder="Kênh áp dụng" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả kênh</SelectItem>
                    {channels.map((channel) => <SelectItem key={channel.id} value={channel.id}>{channel.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={form.trigger} onValueChange={(trigger) => setForm({ ...form, trigger })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new_lead">Có lead mới</SelectItem>
                    <SelectItem value="new_message">Có tin nhắn mới</SelectItem>
                    <SelectItem value="new_comment">Có comment mới</SelectItem>
                    <SelectItem value="lead_idle">Lead quá thời gian chưa xử lý</SelectItem>
                    <SelectItem value="payment_matched">Sepay match thanh toán</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={form.action} onValueChange={(action) => setForm({ ...form, action })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="create_lead">Tạo lead</SelectItem>
                    <SelectItem value="tag_lead">Gắn tag/nguồn</SelectItem>
                    <SelectItem value="notify_admin">Nhắc sale</SelectItem>
                    <SelectItem value="auto_reply">Auto reply</SelectItem>
                    <SelectItem value="mark_payment_paid">Cập nhật thanh toán</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea placeholder="Template phản hồi hoặc ghi chú rule" value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })} />
              </div>
              <Button onClick={createRule} disabled={!form.name}>Lưu rule</Button>
            </DialogContent>
          </Dialog>
        )}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {channels.map((channel) => {
          const Icon = iconMap[channel.provider] ?? Bot;
          return (
            <Card key={channel.id}>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-primary/10 p-3 text-primary"><Icon className="h-5 w-5" /></div>
                  <Badge variant={channel.status === 'connected' ? 'default' : 'secondary'}>{statusLabel[channel.status]}</Badge>
                </div>
                <div>
                  <h2 className="font-semibold">{channel.name}</h2>
                  <p className="text-sm text-muted-foreground">{channel.provider}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {channel.provider === 'sepay'
                    ? 'Sau này nhận webhook Sepay để match nội dung chuyển khoản với booking code.'
                    : 'Sau này kết nối token/webhook để nhận inbox, comment hoặc lead form.'}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle>Automation rules</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {rules.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Chưa có rule. Nên bắt đầu với rule: “Có lead mới → nhắc sale trong admin”.
            </div>
          )}
          {rules.map((rule) => (
            <div key={rule.id} className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="flex items-center gap-2 font-medium">
                  {rule.isActive && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  {rule.name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {rule.channel?.name ?? 'Tất cả kênh'} · {rule.trigger} → {rule.action}
                </p>
              </div>
              <Switch checked={rule.isActive} onCheckedChange={() => toggleRule(rule)} />
            </div>
          ))}
        </CardContent>
      </Card>
    </AdminPage>
  );
}
