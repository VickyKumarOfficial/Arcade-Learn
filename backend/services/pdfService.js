/**
 * PDF Generation Service
 * Generates personalized learning roadmap PDFs
 */

import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

const pdfService = {
  /**
   * Generate a PDF from AI roadmap recommendations
   * @param {Object} roadmapData - The roadmap data to convert to PDF
   * @param {Object} userData - User information for personalization
   * @returns {Promise<Buffer>} PDF buffer
   */
  async generateRoadmapPDF(roadmapData, userData = {}) {
    return new Promise((resolve, reject) => {
      try {
        // Create a new PDF document
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: 'Personalized Learning Roadmap',
            Author: 'ArcadeLearn',
            Subject: 'AI-Generated Career Development Path',
            Keywords: 'learning, roadmap, career, development'
          }
        });

        // Buffer to store PDF data
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        this._addHeader(doc, userData);
        
        // Overview Section
        this._addOverview(doc, roadmapData, userData);
        
        // Roadmaps Section
        if (roadmapData.roadmaps && roadmapData.roadmaps.length > 0) {
          roadmapData.roadmaps.forEach((roadmap, index) => {
            if (index > 0) doc.addPage();
            this._addRoadmap(doc, roadmap, index + 1);
          });
        }
        
        // Footer on last page
        this._addFooter(doc);
        
        // Finalize the PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Add header to PDF
   * @private
   */
  _addHeader(doc, userData) {
    // Title
    doc.fontSize(28)
       .fillColor('#2563eb')
       .text('🎯 Your Personalized Learning Roadmap', { align: 'center' });
    
    doc.moveDown(0.5);
    
    // Subtitle
    doc.fontSize(12)
       .fillColor('#64748b')
       .text('AI-Generated Career Development Path', { align: 'center' });
    
    doc.moveDown(0.3);
    
    // User info
    if (userData.name) {
      doc.fontSize(11)
         .fillColor('#334155')
         .text(`Prepared for: ${userData.name}`, { align: 'center' });
    }
    
    // Date
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.fontSize(10)
       .fillColor('#94a3b8')
       .text(`Generated on: ${date}`, { align: 'center' });
    
    doc.moveDown(1);
    
    // Divider line
    doc.strokeColor('#e2e8f0')
       .lineWidth(1)
       .moveTo(50, doc.y)
       .lineTo(545, doc.y)
       .stroke();
    
    doc.moveDown(1.5);
  },

  /**
   * Add overview section
   * @private
   */
  _addOverview(doc, roadmapData, userData) {
    doc.fontSize(16)
       .fillColor('#1e293b')
       .text('📋 Overview', { underline: true });
    
    doc.moveDown(0.5);
    
    // User profile
    if (userData.skillLevel || userData.interests || userData.timeCommitment) {
      doc.fontSize(11)
         .fillColor('#475569');
      
      if (userData.skillLevel) {
        doc.text(`Skill Level: ${userData.skillLevel}`, { continued: false });
      }
      if (userData.interests) {
        doc.text(`Interests: ${userData.interests}`, { continued: false });
      }
      if (userData.timeCommitment) {
        doc.text(`Time Commitment: ${userData.timeCommitment} hours/week`, { continued: false });
      }
      
      doc.moveDown(0.5);
    }
    
    // Summary
    if (roadmapData.reasoning?.summary) {
      doc.fontSize(11)
         .fillColor('#334155')
         .text(roadmapData.reasoning.summary, { align: 'justify' });
      doc.moveDown(0.5);
    }
    
    // Learning approach
    if (roadmapData.reasoning?.learning_approach && roadmapData.reasoning.learning_approach.length > 0) {
      doc.fontSize(12)
         .fillColor('#1e293b')
         .text('Learning Approach:', { underline: false });
      
      doc.fontSize(10)
         .fillColor('#475569');
      
      roadmapData.reasoning.learning_approach.forEach(approach => {
        doc.text(`• ${approach}`, { indent: 20 });
      });
      
      doc.moveDown(0.5);
    }
    
    // Stats
    if (roadmapData.roadmaps && roadmapData.roadmaps.length > 0) {
      doc.fontSize(11)
         .fillColor('#2563eb')
         .text(`Total Roadmaps Generated: ${roadmapData.roadmaps.length}`, { continued: false });
      
      const totalResources = roadmapData.roadmaps.reduce((sum, r) => sum + (r.resources?.length || 0), 0);
      doc.text(`Total Resources: ${totalResources}`, { continued: false });
      
      if (roadmapData.confidence) {
        doc.text(`Confidence Score: ${(roadmapData.confidence * 100).toFixed(0)}%`, { continued: false });
      }
    }
    
    doc.moveDown(1);
  },

  /**
   * Add a single roadmap to PDF
   * @private
   */
  _addRoadmap(doc, roadmap, index) {
    const startY = doc.y;
    
    // Roadmap Header
    doc.fontSize(18)
       .fillColor('#1e293b')
       .text(`Roadmap ${index}: ${this._formatRoadmapId(roadmap.roadmap_id)}`, { underline: true });
    
    doc.moveDown(0.5);
    
    // Priority badge
    const priorityColor = index === 1 ? '#22c55e' : index === 2 ? '#f59e0b' : '#6366f1';
    doc.fontSize(10)
       .fillColor(priorityColor)
       .text(`Priority: ${roadmap.priority} | Score: ${((roadmap.score || roadmap.match_score || 0) * 100).toFixed(0)}%`, { continued: false });
    
    doc.moveDown(0.3);
    
    // Timeline
    doc.fontSize(10)
       .fillColor('#64748b')
       .text(`⏱ Duration: ${roadmap.estimated_completion_weeks} weeks @ ${roadmap.weekly_hours_needed} hours/week`, { continued: false });
    
    doc.moveDown(0.5);
    
    // Reasoning
    if (roadmap.reasoning) {
      doc.fontSize(11)
         .fillColor('#334155')
         .text(roadmap.reasoning, { align: 'justify' });
      
      doc.moveDown(0.8);
    }
    
    // Resources Section
    if (roadmap.resources && roadmap.resources.length > 0) {
      doc.fontSize(14)
         .fillColor('#1e293b')
         .text('📚 Recommended Resources:', { underline: false });
      
      doc.moveDown(0.5);
      
      roadmap.resources.forEach((resource, resIndex) => {
        this._addResource(doc, resource, resIndex + 1);
      });
    }
  },

  /**
   * Add a resource to PDF
   * @private
   */
  _addResource(doc, resource, index) {
    const startY = doc.y;
    
    // Check if we need a new page
    if (startY > 700) {
      doc.addPage();
    }
    
    // Resource number and title
    doc.fontSize(11)
       .fillColor('#2563eb')
       .text(`${index}. ${resource.title}`, { underline: false, continued: false });
    
    // Type and cost badges
    doc.fontSize(9)
       .fillColor('#64748b')
       .text(`   Type: ${resource.type} | Cost: ${resource.cost} | Duration: ${resource.duration}`, { continued: false });
    
    // Description
    if (resource.description) {
      doc.fontSize(9)
         .fillColor('#475569')
         .text(`   ${resource.description}`, { align: 'justify', indent: 15 });
    }
    
    // URL
    if (resource.url) {
      doc.fontSize(9)
         .fillColor('#3b82f6')
         .text(`   🔗 ${resource.url}`, { link: resource.url, underline: true });
    }
    
    doc.moveDown(0.6);
  },

  /**
   * Add footer to PDF
   * @private
   */
  _addFooter(doc) {
    // Move to bottom of page
    const bottomY = 750;
    doc.y = bottomY;
    
    // Divider line
    doc.strokeColor('#e2e8f0')
       .lineWidth(1)
       .moveTo(50, doc.y)
       .lineTo(545, doc.y)
       .stroke();
    
    doc.moveDown(0.5);
    
    // Footer text
    doc.fontSize(9)
       .fillColor('#94a3b8')
       .text('Generated by ArcadeLearn - Your AI-Powered Learning Companion', { align: 'center' });
    
    doc.fontSize(8)
       .fillColor('#cbd5e1')
       .text('https://arcadelearn.com', { align: 'center', link: 'https://arcadelearn.com' });
  },

  /**
   * Format roadmap ID to readable title
   * @private
   */
  _formatRoadmapId(id) {
    return id
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
};

export default pdfService;
