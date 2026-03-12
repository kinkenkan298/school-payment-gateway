import { PaymentProvider } from '@school-payment-gateway/types';
import { BaseProvider } from './base.provider';
import { DuitkuProvider } from './duitku.provider';
import { XenditProvider } from './xendit.provider';
import { MidtransProvider } from './midtrans.provider';

const providers: Record<string, BaseProvider> = {
  duitku: new DuitkuProvider(),
  xendit: new XenditProvider(),
  midtrans: new MidtransProvider(),
};

export const getProvider = (provider: PaymentProvider): BaseProvider => {
  const instance = providers[provider];
  if (!instance) throw new Error(`UNSUPPORTED_PROVIDER: ${provider}`);
  return instance;
};
