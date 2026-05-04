import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CreditCard, ExternalLink, ShieldCheck } from 'lucide-react';
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

function postCheckoutForm(checkout: SepayCheckout, target?: string) {
  if (!checkout.checkoutUrl || !checkout.fields) return false;

  const form = document.createElement('form');
  form.method = checkout.method || 'POST';
  form.action = checkout.checkoutUrl;
  if (target) form.target = target;
  form.style.display = 'none';

  Object.entries(checkout.fields).forEach(([name, value]) => {
    if (value === undefined || value === null) return;
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  form.remove();
  return true;
}

export default function PaymentCheckoutPage() {
  const { t } = useTranslation();
  const { formatMoney } = useLocalePreferences();
  const { bookingId } = useParams();
  const iframeName = useMemo(() => `sepay_checkout_${bookingId || 'booking'}`, [bookingId]);
  const submittedRef = useRef(false);
  const [stored, setStored] = useState<StoredCheckout | null>(null);
  const [embedAttempted, setEmbedAttempted] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(storageKey(bookingId));
    if (!raw) return;

    try {
      setStored(JSON.parse(raw) as StoredCheckout);
    } catch {
      setStored(null);
    }
  }, [bookingId]);

  useEffect(() => {
    if (!stored?.checkout || submittedRef.current) return;
    submittedRef.current = true;
    const timer = window.setTimeout(() => {
      const submitted = postCheckoutForm(stored.checkout, iframeName);
      setEmbedAttempted(submitted);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [iframeName, stored]);

  const openFullPage = (event?: FormEvent) => {
    event?.preventDefault();
    if (!stored?.checkout) return;
    postCheckoutForm(stored.checkout);
  };

  const amount = stored?.booking.depositAmount || stored?.booking.totalPrice || 0;
  const bookingCode = stored?.booking.bookingCode || stored?.booking.paymentReference || bookingId;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20">
        <section className="bg-muted/30 px-4 py-8 md:px-8">
          <div className="container-custom mx-auto">
            <div className="mx-auto max-w-4xl">
              <div className="mb-5 flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
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

                <Button type="button" variant="outline" onClick={openFullPage} disabled={!stored?.checkout}>
                  <ExternalLink className="h-4 w-4" />
                  {t('payment_checkout.open_full_page')}
                </Button>
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
                  <iframe
                    name={iframeName}
                    title="SePay checkout"
                    className="h-[720px] w-full bg-white"
                  />
                  {embedAttempted && (
                    <div className="border-t bg-muted/40 p-4 text-sm text-muted-foreground">
                      {t('payment_checkout.embed_fallback')}
                    </div>
                  )}
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
