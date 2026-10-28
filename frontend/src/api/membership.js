import apiClient from './client';

export const membershipApi = {
  // Get all membership plans
  getPlans: () => apiClient.get('/ulms/plans'),

  // Get upgrade membership plans with discounted proration
  getUpgradePlans: () => apiClient.get('/ulms/upgrade-plan'),

  // Get current active membership of logged in user
  getMyMembership: () => apiClient.get('/ulms/my-membership'),

  // Purchase / Renew / Upgrade membership plan
  // paymentMethod: 1 (Cash), 2 (VNPay)
  // planType: true (New / Extend), false (Upgrade)
  purchasePlan: (planId, paymentMethod = 2, planType = true) =>
    apiClient.post('/ulms/plans', null, {
      params: { paymentMethod, planId, planType },
    }),

  // Get library rules and deposit settings
  getRules: () => apiClient.get('/ulms/rules'),
};
