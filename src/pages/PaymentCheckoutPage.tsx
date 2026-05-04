import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CreditCard, LockKeyhole, ReceiptText, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import type { BookingResponse, SepayCheckout } from '@/services/booking.service';
import { useLocalePreferences } from '@/contexts/LocalePreferencesContext';

interface StoredCheckout {
  booking: BookingResponse;
  checkout: SepayCheckout;
}

const storageKey = (bookingId?: string) => `sepay_checkout_${bookingId || ''}`;

export default function PaymentCheckoutPage() {
  const { t } = useTranslation();
  const { formatMoney } = useLocalePreferences();
  const { bookingId } = useParams();
  const [stored, setStored] = useState<StoredCheckout | null>(null);
  const checkoutFields = useMemo(() => Object.entries(stored?.checkout?.fields ?? {})
    .filter(([, value]) => value !== undefined && value !== null), [stored]);

  useEffect(() => {
    const raw = sessionStorage.getItem(storageKey(bookingId));
    if (!raw) return;

    try {
      setStored(JSON.parse(raw) as StoredCheckout);
    } catch {
      setStored(null);
    }
  }, [bookingId]);

  const amount = stored?.booking.depositAmount || stored?.booking.totalPrice || 0;
  const bookingCode = stored?.booking.bookingCode || stored?.booking.paymentReference || bookingId;
  const checkout = stored?.checkout;
  const canSubmit = Boolean(checkout?.configured && checkout?.checkoutUrl && checkoutFields.length > 0);
  const fieldValue = (name: string) => checkout?.fields?.[name] ?? checkout?.fields?.[name.toUpperCase()];
  const invoiceNumber = fieldValue('order_invoice_number') || stored?.booking.paymentReference || bookingCode;
  const orderDescription = fieldValue('order_description') || stored?.booking.transferContent || bookingCode;
  const paymentMethod = fieldValue('payment_method') || 'BANK_TRANSFER';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20">
        <section className="bg-muted/30 px-4 py-8 md:px-8">
          <div className="container-custom mx-auto">
            <div className="mx-auto max-w-4xl">
              <div className="mb-5 rounded-2xl border bg-card p-5 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <ShieldCheck className="h-4 w-4" />
                    {t('payment_checkout.secure_badge')}
                  </div>
                  <h1 className="mt-2 font-display text-2xl font-bold text-foreground md:text-3xl">
                    {t('payment_checkout.title', { bookingCode })}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('payment_checkout.amount_due')}: <span className="font-semibold text-foreground">{formatMoney(amount)}</span>
                  </p>
                </div>
              </div>

              {!stored?.checkout ? (
                <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
                  <CreditCard className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h2 className="mt-4 font-display text-xl font-semibold">{t('payment_checkout.missing_title')}</h2>
                  <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                    {t('payment_checkout.missing_description')}
                  </p>
                  <Button asChild className="mt-6">
                    <Link to="/properties">{t('properties.browse_all')}</Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border bg-card shadow-xl">
                  <div className="grid gap-0 md:grid-cols-[1fr_360px]">
                    <div className="p-6 md:p-8">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <CreditCard className="h-7 w-7" />
                      </div>

                      <h2 className="mt-6 font-display text-2xl font-bold text-foreground">
                        {t('payment_checkout.form_title')}
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        {t('payment_checkout.form_description')}
                      </p>

                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-muted/50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {t('payment_checkout.booking_code')}
                          </p>
                          <p className="mt-1 font-semibold text-foreground">{bookingCode}</p>
                        </div>
                        <div className="rounded-2xl bg-muted/50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {t('payment_checkout.payment_method')}
                          </p>
                          <p className="mt-1 font-semibold text-foreground">{String(paymentMethod).replace(/_/g, ' ')}</p>
                        </div>
                        <div className="rounded-2xl bg-muted/50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {t('payment_checkout.invoice_number')}
                          </p>
                          <p className="mt-1 break-words font-semibold text-foreground">{invoiceNumber}</p>
                        </div>
                        <div className="rounded-2xl bg-muted/50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {t('payment_checkout.amount_due')}
                          </p>
                          <p className="mt-1 text-2xl font-bold text-primary">{formatMoney(amount)}</p>
                        </div>
                      </div>

                      <div className="mt-5 rounded-2xl border bg-background p-4">
                        <div className="flex items-start gap-3">
                          <ReceiptText className="mt-0.5 h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-semibold text-foreground">{t('payment_checkout.transfer_content')}</p>
                            <p className="mt-1 break-words text-sm text-muted-foreground">{orderDescription}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t bg-muted/30 p-6 md:border-l md:border-t-0 md:p-8">
                      <div className="rounded-2xl bg-background p-5 shadow-sm">
                        <LockKeyhole className="h-8 w-8 text-primary" />
                        <h3 className="mt-4 text-lg font-semibold text-foreground">
                          {t('payment_checkout.submit_title')}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {t('payment_checkout.submit_description')}
                        </p>

                        <form
                          method={checkout?.method || 'POST'}
                          action={checkout?.checkoutUrl}
                          className="mt-6"
                        >
                          {checkoutFields.map(([name, value]) => (
                            <input key={name} type="hidden" name={name} value={String(value)} />
                          ))}
                          <Button type="submit" className="h-12 w-full text-base" disabled={!canSubmit}>
                            {t('payment_checkout.pay_now')}
                          </Button>
                        </form>

                        <p className="mt-4 text-xs leading-5 text-muted-foreground">
                          {t('payment_checkout.gateway_note')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
