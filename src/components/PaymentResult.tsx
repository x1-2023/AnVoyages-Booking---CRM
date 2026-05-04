import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Ban, Home, Mail, MessageCircle, RefreshCw, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import { launchSuccessConfetti } from '@/lib/confetti';

type PaymentResultStatus = 'success' | 'error' | 'cancel';

interface PaymentResultVisual {
  icon: LucideIcon;
  tone: string;
  primaryHref: string;
  primaryKey: 'home' | 'retry' | 'browse';
}

const visuals: Record<PaymentResultStatus, PaymentResultVisual> = {
  success: {
    icon: CheckCircle2,
    tone: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    primaryHref: '/',
    primaryKey: 'home',
  },
  error: {
    icon: XCircle,
    tone: 'text-rose-600 bg-rose-50 border-rose-100',
    primaryHref: '/properties',
    primaryKey: 'retry',
  },
  cancel: {
    icon: Ban,
    tone: 'text-amber-600 bg-amber-50 border-amber-100',
    primaryHref: '/properties',
    primaryKey: 'browse',
  },
};

interface PaymentResultProps {
  status: PaymentResultStatus;
}

const PaymentResult = ({ status }: PaymentResultProps) => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [searchParams] = useSearchParams();
  const { bookingCode: pathBookingCode } = useParams();
  const visual = visuals[status];
  const Icon = visual.icon;
  const bookingCode = pathBookingCode || searchParams.get('bookingCode') || searchParams.get('order_invoice_number');
  const paymentReference = searchParams.get('paymentReference') || searchParams.get('invoice');
  const nextSteps = t(`payment_result.${status}.next_steps`, { returnObjects: true }) as string[];
  const contactEmail = settings.contact_email || 'contact@anvoyages.vn';
  const emailSubject = encodeURIComponent(
    t('payment_result.email_subject', { bookingCode: bookingCode || t('payment_result.missing_callback') }),
  );
  const emailBody = encodeURIComponent(
    t('payment_result.email_body', {
      bookingCode: bookingCode || t('payment_result.missing_callback'),
      paymentReference: paymentReference || bookingCode || t('payment_result.missing_callback'),
    }),
  );
  const emailHref = `mailto:${contactEmail}?subject=${emailSubject}&body=${emailBody}`;

  useEffect(() => {
    if (status === 'success') {
      launchSuccessConfetti();
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20">
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 md:py-20">
          <div className="container-custom mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mx-auto max-w-3xl text-center"
            >
              <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border ${visual.tone}`}>
                <Icon className="h-10 w-10" />
              </div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
                {t(`payment_result.${status}.badge`)}
              </p>
              <h1 className="font-display text-3xl font-bold text-foreground md:text-5xl">
                {t(`payment_result.${status}.title`)}
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {t(`payment_result.${status}.description`)}
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-10 md:py-16">
          <div className="container-custom mx-auto px-4 md:px-8">
            <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-lg md:p-8"
              >
                <h2 className="font-display text-2xl font-semibold text-foreground">{t('payment_result.next_steps_title')}</h2>
                <div className="mt-6 space-y-4">
                  {nextSteps.map((step, index) => (
                    <div key={step} className="flex gap-4 rounded-xl bg-muted/60 p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link to={visual.primaryHref}>
                      {status === 'error' ? <RefreshCw className="h-4 w-4" /> : <Home className="h-4 w-4" />}
                      {t(`payment_result.${visual.primaryKey}`)}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                    <Link to="/contact">
                      <MessageCircle className="h-4 w-4" />
                      {t('payment_result.contact_support')}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                    <a href={emailHref}>
                      <Mail className="h-4 w-4" />
                      {t('payment_result.email_support')}
                    </a>
                  </Button>
                </div>
              </motion.div>

              <motion.aside
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.18 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-lg md:p-8"
              >
                <h2 className="font-display text-2xl font-semibold text-foreground">{t('payment_result.reconciliation_title')}</h2>
                <div className="mt-6 space-y-4 text-sm">
                  <div className="rounded-xl bg-muted/60 p-4">
                    <p className="text-muted-foreground">{t('payment_result.booking_code')}</p>
                    <p className="mt-1 break-all font-semibold text-foreground">
                      {bookingCode || t('payment_result.missing_callback')}
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-4">
                    <p className="text-muted-foreground">{t('payment_result.payment_reference')}</p>
                    <p className="mt-1 break-all font-semibold text-foreground">
                      {paymentReference || bookingCode || t('payment_result.missing_callback')}
                    </p>
                  </div>
                </div>
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                  {t('payment_result.support_note')}
                </p>
              </motion.aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentResult;
