import supabaseAdmin from '../lib/supabase.js';

class CertificateService {
  constructor() {
    this.supabase = supabaseAdmin;
  }

  // Generate certificate for completed roadmap
  async generateCertificate(userId, roadmapId, roadmapTitle) {
    try {
      // Check if user has completed the roadmap
      const { data: progress, error: progressError } = await this.supabase
        .from('user_game_data')
        .select('completed_roadmaps')
        .eq('user_id', userId)
        .single();

      if (progressError) {
        console.error('Error checking user progress:', progressError);
        return { success: false, error: progressError.message };
      }

      if (!progress.completed_roadmaps.includes(roadmapId)) {
        return { success: false, error: 'Roadmap not completed' };
      }

      // Generate verification code
      const verificationCode = `AC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create certificate record
      const certificateData = {
        user_id: userId,
        roadmap_id: roadmapId,
        roadmap_title: roadmapTitle,
        verification_code: verificationCode,
        issued_at: new Date().toISOString(),
        certificate_url: `https://certificates.arcadelearn.com/${verificationCode}` // Placeholder URL
      };

      const { data: certificate, error } = await this.supabase
        .from('certificates')
        .insert([certificateData])
        .select()
        .single();

      if (error) {
        console.error('Error creating certificate:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: certificate };
    } catch (error) {
      console.error('Error in generateCertificate:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user certificates
  async getUserCertificates(userId) {
    try {
      const { data: certificates, error } = await this.supabase
        .from('certificates')
        .select('*')
        .eq('user_id', userId)
        .order('issued_at', { ascending: false });

      if (error) {
        console.error('Error fetching certificates:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: certificates };
    } catch (error) {
      console.error('Error in getUserCertificates:', error);
      return { success: false, error: error.message };
    }
  }

  // Verify certificate by verification code
  async verifyCertificate(verificationCode) {
    try {
      const { data: certificate, error } = await this.supabase
        .from('certificates')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            email
          )
        `)
        .eq('verification_code', verificationCode)
        .single();

      if (error) {
        console.error('Error verifying certificate:', error);
        return { success: false, error: 'Certificate not found' };
      }

      return { success: true, data: certificate };
    } catch (error) {
      console.error('Error in verifyCertificate:', error);
      return { success: false, error: error.message };
    }
  }

  // Get certificate analytics
  async getCertificateAnalytics() {
    try {
      const { data, error } = await this.supabase
        .from('certificates')
        .select(`
          roadmap_id,
          roadmap_title,
          issued_at
        `);

      if (error) {
        console.error('Error fetching certificate analytics:', error);
        return { success: false, error: error.message };
      }

      // Calculate analytics
      const analytics = {
        total_certificates: data.length,
        roadmap_completion_rates: data.reduce((acc, cert) => {
          acc[cert.roadmap_id] = (acc[cert.roadmap_id] || 0) + 1;
          return acc;
        }, {}),
        monthly_completions: data.reduce((acc, cert) => {
          const month = new Date(cert.issued_at).toISOString().slice(0, 7);
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {})
      };

      return { success: true, data: analytics };
    } catch (error) {
      console.error('Error in getCertificateAnalytics:', error);
      return { success: false, error: error.message };
    }
  }
}

export const certificateService = new CertificateService();
export default CertificateService;
