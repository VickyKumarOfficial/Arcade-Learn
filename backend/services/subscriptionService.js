import supabaseAdmin from '../lib/supabase.js';

class SubscriptionService {
  constructor() {
    this.supabase = supabaseAdmin;
  }

  // Get user subscription status
  async getUserSubscription(userId) {
    try {
      const { data: subscription, error } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        data: subscription || { 
          plan_type: 'free', 
          status: 'inactive' 
        } 
      };
    } catch (error) {
      console.error('Error in getUserSubscription:', error);
      return { success: false, error: error.message };
    }
  }

  // Update user subscription
  async updateSubscription(userId, subscriptionData) {
    try {
      const { data, error } = await this.supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          ...subscriptionData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating subscription:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in updateSubscription:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if user has access to premium features
  async checkPremiumAccess(userId, feature) {
    try {
      const subscriptionResult = await this.getUserSubscription(userId);
      
      if (!subscriptionResult.success) {
        return { success: false, error: subscriptionResult.error };
      }

      const subscription = subscriptionResult.data;
      const hasAccess = subscription.status === 'active' || feature === 'basic';

      return { 
        success: true, 
        data: { 
          hasAccess, 
          subscription 
        } 
      };
    } catch (error) {
      console.error('Error in checkPremiumAccess:', error);
      return { success: false, error: error.message };
    }
  }

  // Get subscription analytics
  async getSubscriptionAnalytics() {
    try {
      const { data, error } = await this.supabase
        .from('subscriptions')
        .select(`
          plan_type,
          status,
          created_at,
          current_period_start,
          current_period_end
        `);

      if (error) {
        console.error('Error fetching subscription analytics:', error);
        return { success: false, error: error.message };
      }

      // Calculate analytics
      const analytics = {
        total_subscriptions: data.length,
        active_subscriptions: data.filter(s => s.status === 'active').length,
        plan_distribution: data.reduce((acc, sub) => {
          acc[sub.plan_type] = (acc[sub.plan_type] || 0) + 1;
          return acc;
        }, {}),
        monthly_revenue: data
          .filter(s => s.status === 'active' && s.plan_type !== 'free')
          .length * 9.99 // Assuming $9.99 per month
      };

      return { success: true, data: analytics };
    } catch (error) {
      console.error('Error in getSubscriptionAnalytics:', error);
      return { success: false, error: error.message };
    }
  }
}

export const subscriptionService = new SubscriptionService();
export default SubscriptionService;
