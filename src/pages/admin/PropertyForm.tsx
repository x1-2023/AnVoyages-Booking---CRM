import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ImagePlus, Plus, Trash2, Upload } from 'lucide-react';
import AdminPage from '@/components/admin/AdminPage';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { locationService, Location } from '@/services/location.service';
import { CreatePropertyDto, PricingRule, ProductCategory, ProductOption, propertyService } from '@/services/property.service';
import { useToast } from '@/hooks/use-toast';
import { encodeAmenity, parseAmenity } from '@/lib/amenities';

const defaultCategories = [
  { name: 'Khách sạn', slug: 'hotel' },
  { name: 'Homestay', slug: 'homestay' },
  { name: 'Tour', slug: 'tour' },
  { name: 'Du thuyền', slug: 'cruise' },
];

function splitLines(value: string) {
  return value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
}

const createEmptyPricingRule = (): PricingRule => ({
  name: '',
  startDate: '',
  endDate: '',
  months: [],
  weekdays: [],
  price: 0,
  adultPrice: 0,
  childPrice: 0,
  extraFee: 0,
  minNights: 0,
});

const createEmptyOption = (type = 'package'): ProductOption => ({
  optionType: type,
  name: '',
  nameVi: '',
  nameEn: '',
  descriptionVi: '',
  descriptionEn: '',
  basePrice: 0,
  costPrice: 0,
  maxGuests: 1,
  maxAdults: 2,
  maxChildren: 0,
  includedGuests: 2,
  extraGuestFee: 0,
  inventoryQuantity: 1,
  durationDays: undefined,
  bedType: '',
  bedCount: 1,
  areaSqm: undefined,
  images: [],
  amenities: [],
  amenitiesVi: [],
  amenitiesEn: [],
  pricingRules: [],
  isActive: true,
  sortOrder: 0,
});

function cleanPricingRules(rules?: PricingRule[]) {
  return (rules || [])
    .map((rule) => ({
      name: rule.name?.trim() || undefined,
      startDate: rule.startDate || undefined,
      endDate: rule.endDate || undefined,
      months: Array.isArray(rule.months) ? rule.months.map(Number).filter(Boolean) : undefined,
      weekdays: Array.isArray(rule.weekdays) ? rule.weekdays.map(Number).filter((value) => value >= 0 && value <= 6) : undefined,
      holidayDates: Array.isArray(rule.holidayDates) ? rule.holidayDates.filter(Boolean) : undefined,
      price: Number(rule.price || rule.basePrice) || undefined,
      adultPrice: Number(rule.adultPrice) || undefined,
      childPrice: Number(rule.childPrice) || undefined,
      extraFee: Number(rule.extraFee) || 0,
      minNights: Number(rule.minNights) || undefined,
      requiredMealName: rule.requiredMealName?.trim() || undefined,
      requiredMealPrice: Number(rule.requiredMealPrice) || undefined,
      requiredMealChargeType: rule.requiredMealChargeType || undefined,
      priority: Number(rule.priority) || undefined,
    }))
    .filter((rule) => rule.name || rule.startDate || rule.endDate || rule.months?.length || rule.weekdays?.length || rule.holidayDates?.length || rule.price || rule.adultPrice || rule.childPrice || rule.extraFee || rule.minNights || rule.requiredMealPrice);
}

function cleanProductOptions(options?: ProductOption[]) {
  return (options || [])
    .map((option, index) => ({
      ...option,
      name: option.nameVi || option.name,
      description: option.descriptionVi || option.description,
      basePrice: Number(option.basePrice) || 0,
      adultPrice: Number(option.adultPrice) || undefined,
      childPrice: Number(option.childPrice) || undefined,
      costPrice: Number(option.costPrice) || 0,
      maxGuests: Number(option.maxGuests) || undefined,
      maxAdults: Number(option.maxAdults) || undefined,
      maxChildren: Number(option.maxChildren) || undefined,
      includedGuests: Number(option.includedGuests) || undefined,
      extraGuestFee: Number(option.extraGuestFee) || undefined,
      inventoryQuantity: Number(option.inventoryQuantity) || undefined,
      durationDays: Number(option.durationDays) || undefined,
      areaSqm: Number(option.areaSqm) || undefined,
      bedCount: Number(option.bedCount) || undefined,
      sortOrder: Number(option.sortOrder) || index,
      pricingRules: cleanPricingRules(option.pricingRules),
      isActive: option.isActive ?? true,
    }))
    .filter((option) => option.name && option.basePrice > 0);
}

const amenityIconOptions = [
  { value: 'sparkle', label: 'Điểm nổi bật' },
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'meal', label: 'Bữa ăn' },
  { value: 'restaurant', label: 'Nhà hàng' },
  { value: 'transfer', label: 'Đưa đón' },
  { value: 'guide', label: 'Hướng dẫn viên' },
  { value: 'kayak', label: 'Kayak' },
  { value: 'bike', label: 'Xe đạp' },
  { value: 'car', label: 'Ô tô' },
  { value: 'cruise', label: 'Tàu / du thuyền' },
  { value: 'pool', label: 'Bể bơi' },
  { value: 'spa', label: 'Spa' },
  { value: 'bar', label: 'Bar' },
  { value: 'beach', label: 'Bãi biển' },
  { value: 'ticket', label: 'Vé' },
];

function parseAmenityLines(value: string) {
  return splitLines(value).map(parseAmenity);
}

function mergeAmenityRows(viText: string, enText: string) {
  const viAmenities = parseAmenityLines(viText);
  const enAmenities = parseAmenityLines(enText);
  const length = Math.max(1, viAmenities.length, enAmenities.length);

  return Array.from({ length }, (_, index) => ({
    icon: viAmenities[index]?.icon || enAmenities[index]?.icon || 'sparkle',
    labelVi: viAmenities[index]?.label || '',
    labelEn: enAmenities[index]?.label || '',
  }));
}

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = Boolean(id);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [imagesText, setImagesText] = useState('');
  const [amenitiesText, setAmenitiesText] = useState('');
  const [amenitiesEnText, setAmenitiesEnText] = useState('');
  const [form, setForm] = useState<CreatePropertyDto>({
    name: '',
    nameVi: '',
    nameEn: '',
    description: '',
    descriptionVi: '',
    descriptionEn: '',
    type: 'hotel',
    basePrice: 0,
    adultPrice: 0,
    childPrice: 0,
    extraFee: 0,
    pricingRules: [],
    maxGuests: 1,
    images: [],
    amenities: [],
    amenitiesVi: [],
    amenitiesEn: [],
    isActive: true,
    locationId: '',
    seoTitleVi: '',
    seoTitleEn: '',
    seoDescriptionVi: '',
    seoDescriptionEn: '',
    seoKeywordsVi: '',
    seoKeywordsEn: '',
    options: [],
  });

  const loadCategories = async () => {
    const data = await propertyService.getCategories(true);
    setCategories(data);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [locationsData, categoriesData] = await Promise.all([
          locationService.getAll(true),
          propertyService.getCategories(true),
        ]);
        setLocations(locationsData);
        setCategories(categoriesData);

        if (id) {
          const product = await propertyService.getById(id);
          setForm({
            name: product.name,
            nameVi: product.nameVi || product.name,
            nameEn: product.nameEn || '',
            description: product.description || '',
            descriptionVi: product.descriptionVi || product.description || '',
            descriptionEn: product.descriptionEn || '',
            type: product.type,
            basePrice: product.basePrice,
            adultPrice: product.adultPrice || product.basePrice,
            childPrice: product.childPrice || 0,
            extraFee: product.extraFee || 0,
            pricingRules: product.pricingRules || [],
            maxGuests: product.maxGuests || 1,
            images: product.images,
            amenities: product.amenities,
            amenitiesVi: product.amenitiesVi || product.amenities,
            amenitiesEn: product.amenitiesEn || [],
            isActive: product.isActive,
            locationId: product.locationId,
            costPrice: product.costPrice,
            durationDays: product.durationDays,
            seoTitleVi: product.seoTitleVi || '',
            seoTitleEn: product.seoTitleEn || '',
            seoDescriptionVi: product.seoDescriptionVi || '',
            seoDescriptionEn: product.seoDescriptionEn || '',
            seoKeywordsVi: product.seoKeywordsVi || '',
            seoKeywordsEn: product.seoKeywordsEn || '',
            options: product.options || [],
          });
          setImagesText(product.images.join('\n'));
          setAmenitiesText((product.amenitiesVi || product.amenities).join(', '));
          setAmenitiesEnText((product.amenitiesEn || []).join(', '));
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải dữ liệu';
        toast({ title: 'Lỗi', description: message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, toast]);

  const availableCategories = useMemo(() => {
    const existingSlugs = new Set(categories.map((category) => category.slug));
    return [
      ...categories,
      ...defaultCategories
        .filter((category) => !existingSlugs.has(category.slug))
        .map((category) => ({ id: category.slug, name: category.name, slug: category.slug, isActive: true, sortOrder: 0 })),
    ];
  }, [categories]);

  const imagePreview = useMemo(() => splitLines(imagesText), [imagesText]);
  const amenityRows = useMemo(() => mergeAmenityRows(amenitiesText, amenitiesEnText), [amenitiesEnText, amenitiesText]);

  const setAmenityRows = (rows: Array<{ icon: string; labelVi: string; labelEn: string }>) => {
    const cleanRows = rows.filter((row) => row.labelVi.trim() || row.labelEn.trim());
    setAmenitiesText(cleanRows.map((row) => encodeAmenity(row.icon, row.labelVi || row.labelEn)).filter(Boolean).join('\n'));
    setAmenitiesEnText(cleanRows.map((row) => encodeAmenity(row.icon, row.labelEn || row.labelVi)).filter(Boolean).join('\n'));
  };

  const updateAmenityRow = (index: number, patch: Partial<{ icon: string; labelVi: string; labelEn: string }>) => {
    setAmenityRows(amenityRows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  };

  const addAmenityRow = () => {
    setAmenityRows([...amenityRows, { icon: 'sparkle', labelVi: '', labelEn: '' }]);
  };

  const removeAmenityRow = (index: number) => {
    setAmenityRows(amenityRows.filter((_, rowIndex) => rowIndex !== index));
  };

  const createCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const category = await propertyService.createCategory({ name: newCategoryName.trim(), isActive: true });
      await loadCategories();
      setForm((prev) => ({ ...prev, type: category.slug }));
      setNewCategoryName('');
      toast({ title: 'Đã thêm phân loại', description: category.name });
    } catch (error) {
      toast({
        title: 'Không thêm được phân loại',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại',
        variant: 'destructive',
      });
    }
  };

  const uploadImages = async (files?: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const uploaded = await Promise.all(Array.from(files).map((file) => propertyService.uploadImage(file)));
      const urls = uploaded.map((item) => item.url);
      setImagesText((prev) => [...splitLines(prev), ...urls].join('\n'));
      toast({ title: 'Đã upload ảnh', description: `${urls.length} ảnh đã được thêm vào sản phẩm.` });
    } catch (error) {
      toast({
        title: 'Không upload được ảnh',
        description: error instanceof Error ? error.message : 'Vui lòng thử lại',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const updatePricingRule = (index: number, patch: Partial<PricingRule>) => {
    setForm((prev) => ({
      ...prev,
      pricingRules: (prev.pricingRules || []).map((rule, ruleIndex) => (
        ruleIndex === index ? { ...rule, ...patch } : rule
      )),
    }));
  };

  const addPricingRule = () => {
    setForm((prev) => ({
      ...prev,
      pricingRules: [...(prev.pricingRules || []), createEmptyPricingRule()],
    }));
  };

  const removePricingRule = (index: number) => {
    setForm((prev) => ({
      ...prev,
      pricingRules: (prev.pricingRules || []).filter((_, ruleIndex) => ruleIndex !== index),
    }));
  };

  const defaultOptionType = form.type === 'hotel' || form.type === 'homestay'
    ? 'room'
    : form.type === 'cruise'
      ? 'cabin'
      : form.type === 'transport' || form.type === 'car-rental'
        ? 'vehicle'
        : 'package';

  const updateProductOption = (index: number, patch: Partial<ProductOption>) => {
    setForm((prev) => ({
      ...prev,
      options: (prev.options || []).map((option, optionIndex) => (
        optionIndex === index ? { ...option, ...patch } : option
      )),
    }));
  };

  const updateOptionPricingRulesJson = (index: number, value: string) => {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        updateProductOption(index, { pricingRules: parsed });
      }
    } catch {
      // Keep the last valid rules while the admin is editing an incomplete JSON block.
    }
  };

  const addProductOption = () => {
    setForm((prev) => ({
      ...prev,
      options: [...(prev.options || []), createEmptyOption(defaultOptionType)],
    }));
  };

  const removeProductOption = (index: number) => {
    setForm((prev) => ({
      ...prev,
      options: (prev.options || []).filter((_, optionIndex) => optionIndex !== index),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      const payload: CreatePropertyDto = {
        ...form,
        images: splitLines(imagesText),
        amenities: splitLines(amenitiesText),
        amenitiesVi: splitLines(amenitiesText),
        amenitiesEn: splitLines(amenitiesEnText),
        name: form.nameVi || form.name,
        description: form.descriptionVi || form.description,
        basePrice: Number(form.basePrice),
        adultPrice: Number(form.adultPrice) || Number(form.basePrice),
        childPrice: Number(form.childPrice) || undefined,
        extraFee: Number(form.extraFee) || 0,
        pricingRules: cleanPricingRules(form.pricingRules),
        costPrice: Number(form.costPrice) || 0,
        durationDays: Number(form.durationDays) || undefined,
        maxGuests: Number(form.maxGuests) || 1,
        options: cleanProductOptions(form.options),
      };

      if (isEdit && id) {
        await propertyService.update(id, payload);
      } else {
        await propertyService.create(payload);
      }

      toast({
        title: 'Thành công',
        description: isEdit ? 'Đã cập nhật sản phẩm du lịch' : 'Đã tạo sản phẩm du lịch',
      });
      navigate('/admin/properties');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể lưu sản phẩm du lịch';
      toast({ title: 'Lỗi', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminPage>
        <AdminPageHeader
          title={isEdit ? 'Chỉnh sửa sản phẩm du lịch' : 'Thêm sản phẩm du lịch'}
          description="Quản lý tour, combo, du thuyền, khách sạn, thuê xe và các dịch vụ du lịch."
        />
        <div className="flex h-64 items-center justify-center rounded-xl border bg-card">
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title={isEdit ? 'Chỉnh sửa sản phẩm du lịch' : 'Thêm sản phẩm du lịch'}
        description="Quản lý tour, combo, du thuyền, khách sạn, thuê xe, trekking và các dịch vụ du lịch."
        actions={
          <Link to="/admin/properties">
            <Button variant="outline">Quay lại danh sách</Button>
          </Link>
        }
      />

      <div className="max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên sản phẩm</Label>
                  <Input
                    id="name"
                    value={form.nameVi || form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value, nameVi: event.target.value }))}
                    placeholder="VD: Combo Cát Bà 3N2Đ, Du thuyền Hạ Long..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Điểm đến</Label>
                  <Input
                    id="nameEn"
                    value={form.nameEn || ''}
                    onChange={(event) => setForm((prev) => ({ ...prev, nameEn: event.target.value }))}
                    placeholder="English product name"
                    className="mb-3"
                  />
                  <Select value={form.locationId} onValueChange={(value) => setForm((prev) => ({ ...prev, locationId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn điểm đến" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr]">
                <div className="space-y-2">
                  <Label>Phân loại</Label>
                  <Select value={form.type} onValueChange={(value) => setForm((prev) => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phân loại" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((category) => (
                        <SelectItem key={category.slug} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Giá bán</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    min={0}
                    value={form.basePrice}
                    onChange={(event) => setForm((prev) => ({ ...prev, basePrice: Number(event.target.value) }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="costPrice">Giá vốn</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    min={0}
                    value={form.costPrice || 0}
                    onChange={(event) => setForm((prev) => ({ ...prev, costPrice: Number(event.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
                <div>
                  <h3 className="text-sm font-semibold">Nền giá và phụ thu</h3>
                  <p className="text-sm text-muted-foreground">
                    Giá bán vẫn là giá public mặc định. Các trường dưới dùng cho báo giá theo người lớn, trẻ em và mùa cao điểm.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="adultPrice">Giá người lớn</Label>
                    <Input
                      id="adultPrice"
                      type="number"
                      min={0}
                      value={form.adultPrice || 0}
                      onChange={(event) => setForm((prev) => ({ ...prev, adultPrice: Number(event.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="childPrice">Giá trẻ em</Label>
                    <Input
                      id="childPrice"
                      type="number"
                      min={0}
                      value={form.childPrice || 0}
                      onChange={(event) => setForm((prev) => ({ ...prev, childPrice: Number(event.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="extraFee">Phụ thu mặc định</Label>
                    <Input
                      id="extraFee"
                      type="number"
                      min={0}
                      value={form.extraFee || 0}
                      onChange={(event) => setForm((prev) => ({ ...prev, extraFee: Number(event.target.value) }))}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Label>Giá theo ngày / mùa</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addPricingRule} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Thêm mùa giá
                    </Button>
                  </div>

                  {(form.pricingRules || []).length === 0 ? (
                    <div className="rounded-lg border border-dashed bg-background p-4 text-sm text-muted-foreground">
                      Chưa có mùa giá riêng. Hệ thống sẽ dùng giá mặc định ở trên.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(form.pricingRules || []).map((rule, index) => (
                        <div key={index} className="grid gap-3 rounded-lg border bg-background p-3 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1fr_auto]">
                          <Input
                            value={rule.name || ''}
                            onChange={(event) => updatePricingRule(index, { name: event.target.value })}
                            placeholder="Tên mùa"
                          />
                          <Input
                            type="date"
                            aria-label="Ngày bắt đầu"
                            value={rule.startDate || ''}
                            onChange={(event) => updatePricingRule(index, { startDate: event.target.value })}
                          />
                          <Input
                            type="date"
                            aria-label="Ngày kết thúc"
                            value={rule.endDate || ''}
                            onChange={(event) => updatePricingRule(index, { endDate: event.target.value })}
                          />
                          <Input
                            type="number"
                            min={0}
                            value={rule.adultPrice || 0}
                            onChange={(event) => updatePricingRule(index, { adultPrice: Number(event.target.value) })}
                            placeholder="Người lớn"
                          />
                          <Input
                            type="number"
                            min={0}
                            value={rule.childPrice || 0}
                            onChange={(event) => updatePricingRule(index, { childPrice: Number(event.target.value) })}
                            placeholder="Trẻ em"
                          />
                          <Input
                            type="number"
                            min={0}
                            value={rule.extraFee || 0}
                            onChange={(event) => updatePricingRule(index, { extraFee: Number(event.target.value) })}
                            placeholder="Phụ thu"
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => removePricingRule(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <Input
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                    placeholder="Tạo phân loại mới: Thuê xe, Trekking, Vé tham quan..."
                  />
                  <Button type="button" variant="outline" onClick={createCategory} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Thêm phân loại
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxGuests">Số khách tối đa</Label>
                  <Input
                    id="maxGuests"
                    type="number"
                    min={1}
                    value={form.maxGuests || 1}
                    onChange={(event) => setForm((prev) => ({ ...prev, maxGuests: Number(event.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationDays">Số ngày</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    min={0}
                    value={form.durationDays || 0}
                    onChange={(event) => setForm((prev) => ({ ...prev, durationDays: Number(event.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Hạng phòng / cabin / gói dịch vụ</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Khách sạn dùng phòng, du thuyền dùng cabin, tour dùng gói, thuê xe dùng phương tiện.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addProductOption} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Thêm lựa chọn
                  </Button>
                </div>

                {(form.options || []).length === 0 ? (
                  <div className="rounded-lg border border-dashed bg-background p-4 text-sm text-muted-foreground">
                    Chưa có lựa chọn riêng. Website sẽ dùng giá mặc định của sản phẩm.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(form.options || []).map((option, index) => (
                      <div key={index} className="space-y-3 rounded-xl border bg-background p-4">
                        <div className="grid gap-3 md:grid-cols-[160px_1fr_1fr_auto]">
                          <div className="space-y-2">
                            <Label>Loại lựa chọn</Label>
                            <Select value={option.optionType || defaultOptionType} onValueChange={(value) => updateProductOption(index, { optionType: value })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="room">Phòng</SelectItem>
                                <SelectItem value="cabin">Cabin</SelectItem>
                                <SelectItem value="package">Gói tour / combo</SelectItem>
                                <SelectItem value="vehicle">Phương tiện</SelectItem>
                                <SelectItem value="addon">Dịch vụ thêm</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`option-${index}-name-vi`}>Tên lựa chọn (VI)</Label>
                            <Input
                              id={`option-${index}-name-vi`}
                              value={option.nameVi || option.name}
                              onChange={(event) => updateProductOption(index, { name: event.target.value, nameVi: event.target.value })}
                              placeholder="VD: Combo Cát Bà 3N2Đ"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`option-${index}-name-en`}>Tên lựa chọn (EN)</Label>
                            <Input
                              id={`option-${index}-name-en`}
                              value={option.nameEn || ''}
                              onChange={(event) => updateProductOption(index, { nameEn: event.target.value })}
                              placeholder="Example: Cat Ba 3D2N package"
                            />
                          </div>
                          <div className="flex items-end">
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeProductOption(index)} aria-label="Xóa lựa chọn">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-8">
                          <div className="space-y-2">
                            <Label htmlFor={`option-${index}-base-price`}>Giá bán</Label>
                            <Input
                              id={`option-${index}-base-price`}
                              type="number"
                              min={0}
                              value={option.basePrice || 0}
                              onChange={(event) => updateProductOption(index, { basePrice: Number(event.target.value) })}
                              placeholder="VD: 2500000"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`option-${index}-cost-price`}>Giá vốn</Label>
                            <Input
                              id={`option-${index}-cost-price`}
                              type="number"
                              min={0}
                              value={option.costPrice || 0}
                              onChange={(event) => updateProductOption(index, { costPrice: Number(event.target.value) })}
                              placeholder="VD: 1800000"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`option-${index}-max-guests`}>Sức chứa tối đa</Label>
                            <Input
                              id={`option-${index}-max-guests`}
                              type="number"
                              min={1}
                              value={option.maxGuests || 1}
                              onChange={(event) => updateProductOption(index, { maxGuests: Number(event.target.value) })}
                              placeholder="VD: 2"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`option-${index}-max-adults`}>Người lớn tối đa</Label>
                            <Input
                              id={`option-${index}-max-adults`}
                              type="number"
                              min={1}
                              value={option.maxAdults || ''}
                              onChange={(event) => updateProductOption(index, { maxAdults: Number(event.target.value) || undefined })}
                              placeholder="VD: 2"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`option-${index}-max-children`}>Trẻ em tối đa</Label>
                            <Input
                              id={`option-${index}-max-children`}
                              type="number"
                              min={0}
                              value={option.maxChildren ?? ''}
                              onChange={(event) => updateProductOption(index, { maxChildren: Number(event.target.value) || 0 })}
                              placeholder="VD: 1"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`option-${index}-inventory`}>Số lượng bán</Label>
                            <Input
                              id={`option-${index}-inventory`}
                              type="number"
                              min={0}
                              value={option.inventoryQuantity ?? ''}
                              onChange={(event) => updateProductOption(index, { inventoryQuantity: Number(event.target.value) || undefined })}
                              placeholder="VD: 10 phòng"
                            />
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-5">
                          <div className="space-y-2">
                            <Label htmlFor={`option-${index}-duration-days`}>Thời lượng gói (ngày)</Label>
                            <Input
                              id={`option-${index}-duration-days`}
                              type="number"
                              min={1}
                              value={option.durationDays || ''}
                              onChange={(event) => updateProductOption(index, { durationDays: Number(event.target.value) || undefined })}
                              placeholder="VD: 3"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`option-${index}-bed-type`}>Loại giường / cabin</Label>
                            <Input
                              id={`option-${index}-bed-type`}
                              value={option.bedType || ''}
                              onChange={(event) => updateProductOption(index, { bedType: event.target.value })}
                              placeholder="King / Queen / Twin"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`option-${index}-bed-count`}>Số giường / cabin</Label>
                            <Input
                              id={`option-${index}-bed-count`}
                              type="number"
                              min={0}
                              value={option.bedCount || ''}
                              onChange={(event) => updateProductOption(index, { bedCount: Number(event.target.value) || undefined })}
                              placeholder="VD: 1"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`option-${index}-adult-price`}>Giá người lớn</Label>
                            <Input
                              id={`option-${index}-adult-price`}
                              type="number"
                              min={0}
                              value={option.adultPrice || ''}
                              onChange={(event) => updateProductOption(index, { adultPrice: Number(event.target.value) || undefined })}
                              placeholder="Nếu tính theo khách"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`option-${index}-child-price`}>Giá trẻ em</Label>
                            <Input
                              id={`option-${index}-child-price`}
                              type="number"
                              min={0}
                              value={option.childPrice || ''}
                              onChange={(event) => updateProductOption(index, { childPrice: Number(event.target.value) || undefined })}
                              placeholder="Nếu có"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`option-${index}-area`}>Diện tích m2</Label>
                            <Input
                              id={`option-${index}-area`}
                              type="number"
                              min={0}
                              value={option.areaSqm || ''}
                              onChange={(event) => updateProductOption(index, { areaSqm: Number(event.target.value) || undefined })}
                              placeholder="VD: 28"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 rounded-lg border border-dashed bg-muted/20 p-3">
                          <Label htmlFor={`option-${index}-pricing-rules`}>Quy tắc giá riêng cho hạng này (JSON)</Label>
                          <Textarea
                            id={`option-${index}-pricing-rules`}
                            defaultValue={JSON.stringify(option.pricingRules || [], null, 2)}
                            onBlur={(event) => updateOptionPricingRulesJson(index, event.target.value)}
                            placeholder={'[\n  { "name": "Đỉnh điểm T6-T7", "months": [5,6,7,8], "weekdays": [5,6], "price": 1850000, "minNights": 2, "priority": 20 }\n]'}
                            className="min-h-28 font-mono text-xs"
                          />
                          <p className="text-xs text-muted-foreground">
                            Dùng months 1-12, weekdays 0=CN đến 6=T7, holidayDates dạng YYYY-MM-DD, price là giá theo đêm mỗi phòng/cabin.
                          </p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`option-${index}-description-vi`}>Mô tả lựa chọn (VI)</Label>
                            <Textarea
                              id={`option-${index}-description-vi`}
                              value={option.descriptionVi || ''}
                              onChange={(event) => updateProductOption(index, { description: event.target.value, descriptionVi: event.target.value })}
                              placeholder="Nội dung bao gồm, lịch trình, điều kiện áp dụng..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`option-${index}-description-en`}>Mô tả lựa chọn (EN)</Label>
                            <Textarea
                              id={`option-${index}-description-en`}
                              value={option.descriptionEn || ''}
                              onChange={(event) => updateProductOption(index, { descriptionEn: event.target.value })}
                              placeholder="Included services, itinerary, conditions..."
                            />
                          </div>
                        </div>

                        <label className="flex items-center gap-2 text-sm font-medium">
                          <input type="checkbox" checked={option.isActive ?? true} onChange={(event) => updateProductOption(index, { isActive: event.target.checked })} />
                          Đang bán lựa chọn này
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={form.descriptionVi || form.description || ''}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value, descriptionVi: event.target.value }))}
                  rows={5}
                />
              </div>

              <div className="space-y-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <Label htmlFor="images">Ảnh sản phẩm</Label>
                  <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border px-4 text-sm hover:bg-muted">
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Đang upload...' : 'Upload ảnh'}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(event) => uploadImages(event.target.files)}
                    />
                  </label>
                </div>
                <Textarea
                  id="images"
                  value={imagesText}
                  onChange={(event) => setImagesText(event.target.value)}
                  placeholder={"Có thể upload ảnh hoặc dán URL, mỗi dòng một ảnh.\nhttps://example.com/1.jpg"}
                  rows={4}
                />
                {imagePreview.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 pt-2 md:grid-cols-4">
                    {imagePreview.slice(0, 8).map((image) => (
                      <img key={image} src={image} alt="Preview" className="h-28 w-full rounded-md border object-cover" />
                    ))}
                  </div>
                ) : (
                  <div className="flex h-28 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Chưa có ảnh sản phẩm
                  </div>
                )}
              </div>

              <div className="hidden">
                <Label htmlFor="amenities">Tiện ích / điểm nổi bật</Label>
                <Textarea
                  id="amenities"
                  value={amenitiesText}
                  onChange={(event) => setAmenitiesText(event.target.value)}
                  placeholder="xe đưa đón, ăn sáng, kayak, hướng dẫn viên..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descriptionEn">Mô tả (EN)</Label>
                <Textarea
                  id="descriptionEn"
                  value={form.descriptionEn || ''}
                  onChange={(event) => setForm((prev) => ({ ...prev, descriptionEn: event.target.value }))}
                  rows={5}
                />
              </div>

              <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <Label>Chọn icon cho từng tiện ích</Label>
                    <p className="mt-1 text-sm text-muted-foreground">Dùng bảng này thay cho ô text tiện ích nếu muốn icon riêng cho từng dòng.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addAmenityRow} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Thêm tiện ích
                  </Button>
                </div>

                <div className="space-y-3">
                  {amenityRows.map((row, index) => (
                    <div key={index} className="grid gap-3 rounded-lg border bg-background p-3 md:grid-cols-[180px_1fr_1fr_auto]">
                      <Select value={row.icon} onValueChange={(value) => updateAmenityRow(index, { icon: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {amenityIconOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input value={row.labelVi} onChange={(event) => updateAmenityRow(index, { labelVi: event.target.value })} placeholder="VI: Ăn 3 bữa" />
                      <Input value={row.labelEn} onChange={(event) => updateAmenityRow(index, { labelEn: event.target.value })} placeholder="EN: 3 meals included" />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeAmenityRow(index)} aria-label="Xóa tiện ích">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden">
                <Label htmlFor="amenitiesEn">Tiện ích / điểm nổi bật (EN)</Label>
                <Textarea
                  id="amenitiesEn"
                  value={amenitiesEnText}
                  onChange={(event) => setAmenitiesEnText(event.target.value)}
                  placeholder="transfer, breakfast, kayak, tour guide..."
                />
              </div>

              <div className="grid gap-4 rounded-xl border bg-muted/20 p-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="seoTitleVi">SEO title (VI)</Label>
                  <Input id="seoTitleVi" value={form.seoTitleVi || ''} onChange={(event) => setForm((prev) => ({ ...prev, seoTitleVi: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoTitleEn">SEO title (EN)</Label>
                  <Input id="seoTitleEn" value={form.seoTitleEn || ''} onChange={(event) => setForm((prev) => ({ ...prev, seoTitleEn: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoDescriptionVi">Meta description (VI)</Label>
                  <Textarea id="seoDescriptionVi" value={form.seoDescriptionVi || ''} onChange={(event) => setForm((prev) => ({ ...prev, seoDescriptionVi: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoDescriptionEn">Meta description (EN)</Label>
                  <Textarea id="seoDescriptionEn" value={form.seoDescriptionEn || ''} onChange={(event) => setForm((prev) => ({ ...prev, seoDescriptionEn: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoKeywordsVi">SEO keywords (VI)</Label>
                  <Input id="seoKeywordsVi" value={form.seoKeywordsVi || ''} onChange={(event) => setForm((prev) => ({ ...prev, seoKeywordsVi: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoKeywordsEn">SEO keywords (EN)</Label>
                  <Input id="seoKeywordsEn" value={form.seoKeywordsEn || ''} onChange={(event) => setForm((prev) => ({ ...prev, seoKeywordsEn: event.target.value }))} />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                />
                Hiển thị sản phẩm trên website
              </label>

              <Button type="submit" disabled={saving || !form.locationId || !form.type}>
                {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm du lịch'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminPage>
  );
}
