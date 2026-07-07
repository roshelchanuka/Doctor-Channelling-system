import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="privacy-policy-container">
            <div className="privacy-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    ← Back
                </button>
                <h1>Privacy Policy</h1>
            </div>
            
            <div className="privacy-content">
                <section>
                    <h2>1. Information We Collect</h2>
                    <p>
                        We collect information you provide directly to us when you register for an account, 
                        update your profile, book an appointment, or communicate with us. This may include 
                        your name, email address, phone number, medical history summary, and other details 
                        necessary to provide healthcare services.
                    </p>
                </section>

                <section>
                    <h2>2. How We Use Your Information</h2>
                    <p>
                        The information we collect is used to facilitate appointments between patients and 
                        doctors, provide personalized care recommendations, communicate regarding your health 
                        records, and improve the overall Doctor Channelling System experience. We do not 
                        sell your personal data to third parties.
                    </p>
                </section>

                <section>
                    <h2>3. Data Security</h2>
                    <p>
                        We implement appropriate technical and organizational security measures designed to 
                        protect the security of any personal information we process. However, please also 
                        remember that we cannot guarantee that the internet itself is 100% secure.
                    </p>
                </section>

                <section>
                    <h2>4. Your Rights</h2>
                    <p>
                        You have the right to access, correct, or delete your personal information stored 
                        on our platform. You may update your profile details from the dashboard or contact 
                        our support team for assistance with data deletion requests.
                    </p>
                </section>
                
                <p className="privacy-footer-note">
                    Last updated: {new Date().toLocaleDateString()}
                </p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
