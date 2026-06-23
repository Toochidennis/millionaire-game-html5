/**
 * Ad provider abstraction. Keep the rest of the app provider-agnostic so you
 * can swap AdMob / Unity Ads / IronSource behind one interface. All methods
 * are no-ops offline and resolve safely so gameplay never blocks.
 */
export interface AdProvider {
  loadRewarded(): Promise<void>;
  showRewarded(): Promise<{ rewarded: boolean }>;
  showInterstitial(): Promise<void>;
}

const noop: AdProvider = {
  loadRewarded: async () => {},
  showRewarded: async () => ({ rewarded: true }),
  showInterstitial: async () => {},
};

let provider: AdProvider = noop;
export const setAdProvider = (p: AdProvider) => { provider = p; };

/** Grant an extra lifeline / continue in exchange for watching an ad. */
export const watchRewardedAd = () => provider.showRewarded();
/** Shown between matches; frequency-capped in production. */
export const showInterstitial = () => provider.showInterstitial();
