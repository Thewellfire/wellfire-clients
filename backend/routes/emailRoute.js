import 'dotenv/config';
import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Create transporter for email sending
const createTransporter = () => {
    console.log('🔧 Creating transporter with config:', {
        service: 'gmail',
        user: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
        pass: process.env.EMAIL_APP_PASSWORD ? 'SET' : 'NOT SET'
    });

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Your Gmail address
                pass: process.env.EMAIL_APP_PASSWORD // Gmail app password
            }
        });
        console.log('✅ Transporter created successfully');
        return transporter;
    } catch (error) {
        console.log('❌ Error creating transporter:', error);
        throw error;
    }
};

// Send email endpoint
router.post('/send-email', async(req, res) => {
    console.log('📧 Email endpoint hit - /send-email');
    console.log('📋 Request body:', req.body);

    try {
        const { to, subject, html, text } = req.body;

        // Validate required fields
        if (!to || !subject || (!html && !text)) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: to, subject, and either html or text content'
            });
        }

        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: html || text,
            text: text || html // Fallback to html as text if no text provided
        };

        // Add attachments if provided
        if (req.body.attachments && req.body.attachments.length > 0) {
            console.log('📎 Adding attachments:', req.body.attachments.length);
            mailOptions.attachments = req.body.attachments.map(att => ({
                filename: att.filename,
                content: att.content,
                encoding: 'base64',
                contentType: att.contentType || 'application/octet-stream'
            }));
        }

        const info = await transporter.sendMail(mailOptions);

        console.log('Email sent:', info.messageId);

        res.status(200).json({
            success: true,
            message: 'Email sent successfully',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send email. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Send partnership email endpoint
router.post('/send-partnership-email', async(req, res) => {
            try {
                console.log('📧 Partnership email request received:', {
                    body: req.body,
                    hasAttachments: req.body.attachments ? req.body.attachments.length : 0
                });

                const { name, email, phone, website, companyDetail, productInfo, attachments } = req.body;

                // Validate required fields
                if (!name || !email || !phone) {
                    console.log('❌ Validation failed - missing required fields');
                    return res.status(400).json({
                        success: false,
                        message: 'Missing required fields: name, email, and phone'
                    });
                }

                // Check environment variables
                if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
                    console.log('❌ Email configuration missing - check EMAIL_USER and EMAIL_APP_PASSWORD');
                    return res.status(500).json({
                        success: false,
                        message: 'Email service not configured properly'
                    });
                }

                const transporter = createTransporter();

                // Create HTML email content
                const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333; border-bottom: 2px solid #ff4444; padding-bottom: 10px;">
                    New Partnership Application
                </h2>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone}</p>
                    <p><strong>Website:</strong> ${website || 'Not provided'}</p>
                </div>
                
                <div style="margin: 15px 0;">
                    <h3 style="color: #333;">Company Details:</h3>
                    <p style="background-color: #f9f9f9; padding: 10px; border-radius: 5px;">
                        ${companyDetail || 'Not provided'}
                    </p>
                </div>
                
                ${productInfo ? `
                <div style="margin: 15px 0;">
                    <h3 style="color: #333;">Product Information:</h3>
                    <p style="background-color: #f9f9f9; padding: 10px; border-radius: 5px;">
                        ${productInfo}
                    </p>
                </div>
                ` : ''}
                
                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
                    <p>Application submitted on: ${new Date().toLocaleString()}</p>
                </div>
            </div>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'info.wellfire@gmail.com', // Partnership emails go to Wellfire
            subject: `New Partnership Application - ${name}`,
            html: htmlContent,
            text: `New partnership application received:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nWebsite: ${website || 'Not provided'}\nCompany Details: ${companyDetail || 'Not provided'}\n\nProduct Info: ${productInfo || 'Not specified'}\n\nApplication submitted on: ${new Date().toLocaleString()}`
        };

        // Add attachments if provided
        if (attachments && attachments.length > 0) {
            mailOptions.attachments = attachments.map(att => ({
                filename: att.filename,
                content: att.content,
                encoding: 'base64'
            }));
        }

        const info = await transporter.sendMail(mailOptions);

        console.log('Partnership email sent:', info.messageId);

        res.status(200).json({
            success: true,
            message: 'Partnership application sent successfully',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('Partnership email sending error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send partnership application. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Test email configuration endpoint
router.get('/test-config', (req, res) => {
    console.log('🧪 Testing email configuration...');
    console.log('🔍 All environment variables:', Object.keys(process.env).filter(key => key.includes('EMAIL')));
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
    console.log('🔍 Current working directory:', process.cwd());
    
    const config = {
        EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
        EMAIL_APP_PASSWORD: process.env.EMAIL_APP_PASSWORD ? 'SET' : 'NOT SET',
        EMAIL_USER_VALUE: process.env.EMAIL_USER || 'NOT SET',
        allEnvKeys: Object.keys(process.env).length,
        emailKeys: Object.keys(process.env).filter(key => key.includes('EMAIL'))
    };
    
    console.log('📋 Email config:', config);
    
    res.json({
        success: true,
        message: 'Email configuration test',
        config
    });
});

export default router;