import React, { useState } from 'react';
import Header from "../../components/Header/Header";
import BottomDock from "../../components/BottomDock";
import {
  ArrowLeft,
  Inbox,
  MessageCircle,
  Phone,
  MapPin,
  Smartphone,
  User,
  CreditCard,
  ChevronRight,
  CheckCircle,
  Headphones,
  ThumbsUp,
  ThumbsDown,
  X,
  Play,
  FileText,
  Globe,
  Settings,
  Shield,
  DollarSign,
  Car,
  Clock,
  Star
} from 'lucide-react';

function Help({ onLogout = () => {} }) {
  const [activeTab, setActiveTab] = useState("help");
  const [isOnline, setIsOnline] = useState(false);
  const [currentView, setCurrentView] = useState("main"); // main, category, article
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null); // 'yes' or 'no'

  const handleTabChange = (tabId) => {
    if (tabId === "logout") {
      onLogout();
      return;
    }
    setActiveTab(tabId);
  };

  const handleMenuClick = () => {
    console.log('Menu clicked!');
  };

  const handleNotificationClick = () => {
    console.log('Notifications clicked!');
  };

  // Help categories with driver-focused use cases
  const helpCategories = [
    {
      id: "about-vaye",
      title: "About Vaye",
      icon: Globe,
      color: "#4facfe",
      description: "Learn more about Vaye and our services",
      articles: [
        {
          id: "office-locations",
          title: "Where can I find Vaye Offices?",
          hasVideo: true,
          content: `Our Vaye offices are located in major cities across South Africa to provide you with support when you need it.

**Main Office - Johannesburg**
Address: 123 Nelson Mandela Square, Sandton, 2196
Hours: Monday - Friday, 8:00 AM - 6:00 PM
Phone: +27 11 123 4567

**Cape Town Office**
Address: 456 V&A Waterfront, Cape Town, 8001  
Hours: Monday - Friday, 8:00 AM - 6:00 PM
Phone: +27 21 123 4567

**Durban Office**
Address: 789 Umhlanga Ridge, Durban, 4319
Hours: Monday - Friday, 8:00 AM - 6:00 PM  
Phone: +27 31 123 4567

**Port Elizabeth Office**
Address: 321 Boardwalk Boulevard, Port Elizabeth, 6001
Hours: Monday - Friday, 8:00 AM - 5:00 PM
Phone: +27 41 123 4567

You can visit any of these offices for:
• Driver registration and onboarding
• Document verification
• Vehicle inspections
• Technical support
• Account assistance

**Online Support**
If you can't visit an office, our 24/7 online support is always available through the app's chat feature.`
        },
        {
          id: "where-operate",
          title: "Where does Vaye operate?",
          hasVideo: false,
          content: `Vaye currently operates in major cities and towns across South Africa, with plans for expansion.

**Current Operating Cities:**

**Gauteng Province**
• Johannesburg and surrounding areas
• Pretoria and Centurion
• Sandton and Randburg
• Soweto and Alexandra
• Benoni and Boksburg

**Western Cape**
• Cape Town and suburbs
• Stellenbosch and Paarl
• George and surrounding areas

**KwaZulu-Natal**
• Durban and Pinetown
• Pietermaritzburg
• Newcastle

**Eastern Cape**
• Port Elizabeth
• East London

**Free State**
• Bloemfontein

**Service Areas Include:**
• Airport connections in all major cities
• Shopping centers and business districts
• Residential areas and townships
• Tourist destinations and hotels

**Coming Soon:**
We're expanding to more cities based on driver and rider demand. Check the app regularly for updates on new service areas.

**Coverage Hours:**
• 24/7 service in major metropolitan areas
• Extended hours (5 AM - 11 PM) in smaller cities`
        }
      ]
    },
    {
      id: "app-features",
      title: "App and Features",
      icon: Smartphone,
      color: "#51cf66",
      description: "Get help with using the Vaye driver app",
      articles: [
        {
          id: "going-online",
          title: "How do I go online and start accepting trips?",
          hasVideo: true,
          content: `Going online is simple and takes just a few taps.

**Step-by-Step Guide:**

1. **Open the Vaye Driver App**
   - Make sure you're logged into your driver account
   - Ensure your location services are enabled

2. **Check Your Status**
   - You'll see a "Go" button at the bottom center of your screen
   - The button will be yellow when you're offline

3. **Go Online**
   - Press and hold the "Go" button for 1 second
   - The button will fill up with a green progress circle
   - Once complete, you'll be online and ready for trips

4. **Confirm You're Online**
   - The "Go" button turns red and shows "Stop"
   - You'll see "You're online" status message
   - The map will show your location with a car icon

**What Happens Next:**
• You'll start receiving trip requests in your area
• Accept requests by tapping the green "Accept" button
• Decline by tapping "Decline" (avoid too many declines)

**Going Offline:**
• Simply tap the red "Stop" button once
• You'll stop receiving new trip requests
• Complete any ongoing trips before going offline

**Pro Tips:**
• Go online in busy areas for more trip requests
• Peak hours (7-9 AM, 5-7 PM) have more demand
• Check the heat map for high-demand areas`
        },
        {
          id: "navigation-app",
          title: "How do I use the navigation and GPS features?",
          hasVideo: true,
          content: `The Vaye app includes built-in navigation to guide you to pickup and drop-off locations.

**Using Navigation:**

1. **Automatic Navigation**
   - When you accept a trip, navigation starts automatically
   - The map shows the route to the passenger pickup point
   - Follow the blue route line on your screen

2. **Voice Directions**
   - Enable voice guidance in Settings > Navigation
   - Choose your preferred voice language
   - Adjust volume in Settings > Sounds & Voice

3. **Navigation Controls**
   - Tap the navigation bar to see full route details
   - Swipe up for alternative routes
   - Tap "Recalculate" if you miss a turn

4. **Pickup Navigation**
   - Blue route shows path to passenger
   - Passenger's phone number appears when close
   - Tap "Call" to contact them if needed

5. **Trip Navigation**
   - Green route shows path to destination
   - Real-time traffic updates included
   - Estimated arrival time updates automatically

**GPS Settings:**
• Keep GPS on "High Accuracy" mode
• Ensure location services are enabled
• Restart app if GPS seems inaccurate

**Offline Maps:**
• Download offline maps for your city
• Go to Settings > Navigation > Download Maps
• Useful for areas with poor signal

**Tips for Better Navigation:**
• Mount your phone securely in view
• Keep the app in foreground during trips
• Report navigation errors to help improve routes`
        },
        {
          id: "trip-requests",
          title: "How do I handle trip requests and cancellations?",
          hasVideo: false,
          content: `Managing trip requests effectively is key to maximizing your earnings and maintaining good ratings.

**Receiving Trip Requests:**

1. **Request Notification**
   - You'll hear a sound and see a popup
   - Shows passenger rating and estimated trip time
   - Displays pickup location and distance from you

2. **Accepting Requests**
   - Tap the green "Accept" button quickly
   - You have 10-15 seconds to respond
   - Trip details appear once accepted

3. **Declining Requests**
   - Tap "Decline" if you can't take the trip
   - Keep decline rate below 10% for best results
   - Too many declines may reduce future requests

**Managing Cancellations:**

**If Passenger Cancels:**
• You may receive a cancellation fee
• Return to online status automatically
• No impact on your driver rating

**If You Need to Cancel:**
• Contact passenger first to explain
• Use "Cancel Trip" in the app menu
• Select appropriate reason for cancellation
• Excessive cancellations affect your rating

**Best Practices:**
• Accept trips you can complete
• Contact passengers if you're running late
• Only cancel in genuine emergencies
• Be courteous in all communications

**Acceptance Rate Tips:**
• Maintain 80%+ acceptance rate
• Higher acceptance = more trip requests
• Better positioning during peak hours`
        }
      ]
    },
    {
      id: "account-data",
      title: "Account and Data",
      icon: User,
      color: "#ffd43b",
      description: "Manage your driver account and personal information",
      articles: [
        {
          id: "update-documents",
          title: "How do I update my driver documents?",
          hasVideo: true,
          content: `Keeping your documents up to date is essential for continued driving with Vaye.

**Required Documents:**
• Valid driver's license
• Professional Driving Permit (PDP)
• Vehicle registration papers
• Vehicle license disk
• Roadworthy certificate
• Insurance documents

**Updating Documents:**

1. **Access Document Center**
   - Go to Profile > Documents
   - Or tap "Documents" in More menu
   - You'll see all required documents listed

2. **Upload New Documents**
   - Tap the document you need to update
   - Select "Upload New Document"
   - Take a clear photo or select from gallery

3. **Photo Requirements**
   - Ensure good lighting and no shadows
   - Document should fill most of the frame
   - All text must be clearly readable
   - No glare or reflections

4. **Verification Process**
   - Documents are reviewed within 24-48 hours
   - You'll receive notification when approved
   - Continue driving while documents are under review

**Document Renewal Reminders:**
• App sends notifications 30 days before expiry
• Email reminders at 30, 14, and 7 days
• Driving may be suspended if documents expire

**Common Issues:**
• Blurry photos - retake with better lighting
• Expired documents - renew with authorities first
• Wrong document type - check requirements carefully

**Getting Help:**
If you're having trouble uploading documents, contact support through the app chat feature.`
        },
        {
          id: "change-vehicle",
          title: "How do I add or change my vehicle?",
          hasVideo: false,
          content: `You can add multiple vehicles or change your primary vehicle through the app.

**Adding a New Vehicle:**

1. **Vehicle Requirements**
   - Must be 2010 or newer
   - 4-door sedan, hatchback, or SUV
   - Pass Vaye vehicle inspection
   - Valid registration and insurance

2. **Adding Process**
   - Go to Profile > Vehicle Information
   - Tap "Add New Vehicle"
   - Enter vehicle details (make, model, year, etc.)
   - Upload required documents

3. **Required Vehicle Documents**
   - Vehicle registration papers
   - Current license disk
   - Insurance policy covering ride-hailing
   - Roadworthy certificate (if required)

4. **Vehicle Inspection**
   - Schedule inspection at Vaye office
   - Or use approved inspection centers
   - Covers safety, cleanliness, and functionality

**Changing Active Vehicle:**
• Go to Profile > Vehicle Information
• Select the vehicle you want to use
• Tap "Set as Active Vehicle"
• Vehicle change takes effect immediately

**Multiple Vehicle Benefits:**
• Switch between vehicles as needed
• Use different vehicles for different areas
• Continue driving if one vehicle needs repairs

**Vehicle Standards:**
• Keep vehicles clean inside and out
• Ensure air conditioning works
• Maintain good tire condition
• No smoking allowed in vehicles

**Removing a Vehicle:**
• Contact support to remove old vehicles
• Must have no pending trips or payments
• Cannot remove if it's your only vehicle`
        },
        {
          id: "driver-rating",
          title: "How does the driver rating system work?",
          hasVideo: false,
          content: `Your driver rating is crucial for getting more trip requests and maintaining your account in good standing.

**Rating Basics:**
• Rated on a scale of 1-5 stars
• Based on passenger feedback after each trip
• Calculated as average of your last 500 rated trips
• Displayed on your profile and visible to passengers

**What Affects Your Rating:**

**Positive Factors:**
• Clean, well-maintained vehicle
• Safe and smooth driving
• Friendly and professional behavior
• Following GPS directions accurately
• Arriving promptly for pickups

**Negative Factors:**
• Aggressive or unsafe driving
• Dirty or smelly vehicle
• Being rude or unprofessional
• Taking longer routes unnecessarily
• Canceling trips frequently

**Rating Thresholds:**
• **4.7+ stars**: Excellent - Premium trip access
• **4.5-4.69 stars**: Good - Normal trip access
• **4.0-4.49 stars**: Fair - May receive warnings
• **Below 4.0 stars**: At risk of deactivation

**Improving Your Rating:**

1. **Vehicle Maintenance**
   - Keep car clean and odor-free
   - Ensure air conditioning works
   - Offer phone chargers and water

2. **Professional Service**
   - Greet passengers politely
   - Assist with luggage if needed
   - Keep conversations appropriate

3. **Safe Driving**
   - Follow traffic rules
   - Drive smoothly and safely
   - Use GPS for optimal routes

**Monitoring Your Rating:**
• Check rating daily in your profile
• Review feedback trends
• Contact support if you notice sudden drops

**Rating Recovery:**
If your rating drops, focus on providing excellent service. It may take time to improve as new positive ratings replace older ones.`
        }
      ]
    },
    {
      id: "payments-pricing",
      title: "Payments and Pricing",
      icon: CreditCard,
      color: "#a78bfa",
      description: "Understand earnings, payments, and pricing",
      articles: [
        {
          id: "payment-schedule",
          title: "When and how do I get paid?",
          hasVideo: true,
          content: `Vaye offers flexible payment options to ensure you get paid quickly for your work.

**Payment Schedule:**

**Daily Payouts** (Recommended)
• Automatically transfers earnings daily
• Payments processed at 4 AM each day
• Receive money from previous day's trips
• Available Monday through Friday

**Weekly Payouts**
• Earnings paid every Monday
• Includes all trips from previous week
• Larger single payment amount

**Instant Payouts** (Premium Feature)
• Cash out anytime with minimum R50 balance
• Small fee of R5 per instant payout
• Money available within 30 minutes
• Available 24/7 including weekends

**Payment Methods:**

1. **Bank Transfer** (Default)
   - Direct deposit to your bank account
   - Free for daily and weekly payouts
   - Takes 1-2 business days to reflect

2. **Mobile Money**
   - Transfer to your mobile wallet
   - Supports major mobile money providers
   - Instant transfers available

**Payment Breakdown:**
• Trip fare (passenger payment)
• Minus Vaye service fee (20-25%)
• Plus tips and bonuses
• Plus surge pricing multipliers

**Tracking Earnings:**
• View daily earnings in Wallet section
• Weekly summaries available
• Download monthly statements
• Track tips and bonuses separately

**Tax Information:**
• Annual tax statements provided
• Keep records of vehicle expenses
• Consult tax professional for advice`
        },
        {
          id: "surge-pricing",
          title: "How does surge pricing work for drivers?",
          hasVideo: false,
          content: `Surge pricing increases your earnings during high-demand periods.

**What is Surge Pricing:**
• Automatic fare multiplier during busy times
• Increases both your earnings and passenger fares
• Shown as 1.2x, 1.5x, 2.0x, etc.
• Applied to the entire trip fare

**When Surge Occurs:**
• Peak commuting hours (7-9 AM, 5-7 PM)
• Bad weather conditions
• Special events and holidays
• Airport and stadium events
• Weekend nights (Friday/Saturday)

**How Surge Benefits You:**
• Higher earnings per trip
• Same time investment, more money
• Bonuses on top of regular fares
• Tips often higher during surge periods

**Surge Areas:**
• Displayed as colored zones on map
• Red = highest surge (2.0x+)
• Orange = medium surge (1.5-1.9x)
• Yellow = low surge (1.2-1.4x)
• Move to surge areas for higher earnings

**Maximizing Surge Earnings:**

1. **Know Peak Times**
   - Early morning commute
   - Evening rush hour
   - Weekend entertainment districts
   - Airport during flight schedules

2. **Position Strategically**
   - Move toward surge zones
   - Stay near business districts during weekdays
   - Position near entertainment areas on weekends

3. **Weather Awareness**
   - Rain and storms create surge
   - Hot/cold weather increases demand
   - Position accordingly

**Surge Notifications:**
• App alerts when surge begins in your area
• Push notifications for high surge zones
• Map updates in real-time

**Important Notes:**
• Surge applied only to trips accepted during surge
• Passenger pays surge price
• Your percentage remains the same`
        },
        {
          id: "expenses-tax",
          title: "What expenses can I claim and how do I track them?",
          hasVideo: false,
          content: `As a driver, you can claim various business expenses to reduce your tax liability.

**Claimable Expenses:**

**Vehicle Expenses:**
• Fuel costs for business trips
• Vehicle maintenance and repairs
• Insurance premiums
• Vehicle registration and licensing
• Roadworthy certificates

**Equipment and Supplies:**
• Phone mount and chargers
• Cleaning supplies for vehicle
• Air fresheners and amenities
• Driver uniform or clothing

**Phone and Data:**
• Mobile phone bills (business portion)
• Data costs for GPS and app usage
• Phone repairs and replacements

**Other Business Expenses:**
• Parking fees during work
• Toll road charges
• Vehicle inspection fees
• Driver training courses

**Tracking Methods:**

1. **Automatic Tracking (Recommended)**
   - Use expense tracking apps
   - Connect bank accounts for automatic import
   - GPS tracking for business vs personal trips

2. **Manual Tracking**
   - Keep detailed logbook
   - Save all receipts
   - Record date, amount, and purpose
   - Take photos of paper receipts

3. **Vaye App Features**
   - Track business kilometers automatically
   - Export trip data for tax purposes
   - Download earnings statements

**Record Keeping:**
• Keep receipts for 5 years
• Maintain trip logbooks
• Separate business and personal expenses
• Use dedicated business bank account

**Tax Tips:**
• Consult a qualified tax professional
• Consider quarterly tax payments
• Keep detailed records from day one
• Understand your tax obligations as independent contractor

**Deduction Methods:**
• **Actual Expense Method**: Claim actual costs
• **Standard Mileage Rate**: Per-kilometer deduction
• Choose method that gives higher deduction`
        }
      ]
    }
  ];

  const handleCategoryClick = (category) => {
    setCurrentCategory(category);
    setCurrentView("category");
  };

  const handleArticleClick = (article) => {
    setCurrentArticle(article);
    setCurrentView("article");
    setShowFeedback(false);
    setFeedbackType(null);
  };

  const handleBackClick = () => {
    if (currentView === "article") {
      setCurrentView("category");
      setCurrentArticle(null);
      setShowFeedback(false);
      setFeedbackType(null);
    } else if (currentView === "category") {
      setCurrentView("main");
      setCurrentCategory(null);
    }
  };

  const handleFeedbackClick = (type) => {
    setFeedbackType(type);
    setShowFeedback(true);
  };

  const formatContent = (content) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <h3 key={index} className="content-heading">{line.slice(2, -2)}</h3>;
        }
        if (line.startsWith('• ')) {
          return <li key={index} className="content-list-item">{line.slice(2)}</li>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index} className="content-paragraph">{line}</p>;
      });
  };

  // Main Help View
  const renderMainView = () => (
    <div className="help-content">
      <div className="help-header">
        <h1 className="help-title">How can we help?</h1>
      </div>

      {/* Support Cases */}
      <div className="support-section">
        <h2 className="section-title">Support Cases</h2>
        <div className="support-card" onClick={() => console.log('Open inbox')}>
          <div className="support-card-left">
            <div className="support-icon">
              <Inbox size={24} />
            </div>
            <div className="support-content">
              <h3>Inbox</h3>
              <p>View Open Chats</p>
            </div>
          </div>
          <ChevronRight size={20} className="support-arrow" />
        </div>
      </div>

      {/* Get Help With */}
      <div className="help-categories-section">
        <h2 className="section-title">Get help with something else</h2>
        <div className="categories-grid">
          {helpCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <div
                key={category.id}
                className="category-card"
                onClick={() => handleCategoryClick(category)}
                style={{ '--category-color': category.color }}
              >
                <div className="category-icon">
                  <IconComponent size={28} />
                </div>
                <div className="category-content">
                  <h3 className="category-title">{category.title}</h3>
                  <p className="category-description">{category.description}</p>
                </div>
                <ChevronRight size={20} className="category-arrow" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Category View
  const renderCategoryView = () => (
    <div className="help-content">
      <div className="category-header">
        <button className="back-button" onClick={handleBackClick}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="category-page-title">{currentCategory.title}</h1>
      </div>

      <div className="articles-list">
        {currentCategory.articles.map((article) => (
          <div
            key={article.id}
            className="article-card"
            onClick={() => handleArticleClick(article)}
          >
            <div className="article-content">
              <div className="article-header">
                <h3 className="article-title">{article.title}</h3>
                {article.hasVideo && (
                  <div className="video-badge">
                    <Play size={14} />
                    <span>Video</span>
                  </div>
                )}
              </div>
            </div>
            <ChevronRight size={20} className="article-arrow" />
          </div>
        ))}
      </div>
    </div>
  );

  // Article View
  const renderArticleView = () => (
    <div className="help-content">
      <div className="article-header">
        <button className="back-button" onClick={handleBackClick}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="article-page-title">{currentArticle.title}</h1>
      </div>

      {currentArticle.hasVideo && (
        <div className="video-section">
          <div className="video-placeholder">
            <Play size={48} />
            <p>Watch Video Tutorial</p>
          </div>
        </div>
      )}

      <div className="article-content-section">
        <div className="article-text">
          {formatContent(currentArticle.content)}
        </div>
      </div>

      {/* Feedback Section */}
      <div className="feedback-section">
        <div className="feedback-divider"></div>
        
        {!showFeedback ? (
          <div className="feedback-question">
            <h4>Does this information solve your issue?</h4>
            <div className="feedback-buttons">
              <button 
                className="feedback-btn yes"
                onClick={() => handleFeedbackClick('yes')}
              >
                <ThumbsUp size={20} />
                Yes
              </button>
              <button 
                className="feedback-btn no"
                onClick={() => handleFeedbackClick('no')}
              >
                <ThumbsDown size={20} />
                No
              </button>
            </div>
          </div>
        ) : (
          <div className="feedback-response">
            {feedbackType === 'yes' ? (
              <div className="feedback-success">
                <CheckCircle size={48} />
                <h3>Thank you!</h3>
                <p>We're glad we could help you resolve your issue.</p>
              </div>
            ) : (
              <div className="feedback-support">
                <Headphones size={48} />
                <h3>Let's get you more help</h3>
                <p>Our customer service team is ready to assist you personally.</p>
                <div className="support-actions">
                  <button className="support-btn chat">
                    <MessageCircle size={20} />
                    Chat with us
                  </button>
                  <button className="support-btn decline">
                    No thank you
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      {/* Your Original Header */}
      <Header
        notificationCount={5}
        onMenuClick={handleMenuClick}
        onNotificationClick={handleNotificationClick}
      />

      {/* Help Content */}
      <div className="profile-container">
        {currentView === "main" && renderMainView()}
        {currentView === "category" && renderCategoryView()}
        {currentView === "article" && renderArticleView()}
      </div>

      {/* Your Original Bottom Dock */}
      <BottomDock
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOnline={isOnline}
      />

      <style jsx>{`
        .app-layout {
          height: 100vh;
          overflow: hidden;
          background: #f8f9fa;
        }

        .profile-container {
          height: calc(100vh - 140px);
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          padding: 20px;
          margin-top: 70px;
          padding-bottom: 20px;
        }

        /* Main Help Header */
        .help-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .help-title {
          font-size: 2.5rem;
          font-weight: 900;
          color: #1e2761;
          margin: 0;
          line-height: 1.2;
        }

        /* Support Section */
        .support-section {
          margin-bottom: 40px;
        }

        .section-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #1e2761;
          margin: 0 0 20px 0;
        }

        .support-card {
          background: white;
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #f0f0f0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .support-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border-color: #ffd93d;
        }

        .support-card-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .support-icon {
          padding: 12px;
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          border-radius: 12px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .support-content h3 {
          margin: 0 0 4px 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e2761;
        }

        .support-content p {
          margin: 0;
          font-size: 0.9rem;
          color: #64748b;
        }

        .support-arrow {
          color: #94a3b8;
          transition: transform 0.3s ease;
        }

        .support-card:hover .support-arrow {
          transform: translateX(4px);
        }

        /* Categories Section */
        .help-categories-section {
          margin-bottom: 40px;
        }

        .categories-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .category-card {
          background: white;
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #f0f0f0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .category-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border-color: var(--category-color);
        }

        .category-icon {
          padding: 12px;
          background: var(--category-color);
          border-radius: 12px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .category-content {
          flex: 1;
        }

        .category-title {
          margin: 0 0 4px 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e2761;
        }

        .category-description {
          margin: 0;
          font-size: 0.9rem;
          color: #64748b;
        }

        .category-arrow {
          color: #94a3b8;
          transition: transform 0.3s ease;
        }

        .category-card:hover .category-arrow {
          transform: translateX(4px);
        }

        /* Category View */
        .category-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 30px;
        }

        .back-button {
          padding: 8px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-button:hover {
          background: #f8fafc;
          color: #1e2761;
        }

        .category-page-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #1e2761;
          margin: 0;
        }

        .articles-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .article-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #f0f0f0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .article-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border-color: #ffd93d;
        }

        .article-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .article-title {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 600;
          color: #1e2761;
        }

        .video-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #ef4444;
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .article-arrow {
          color: #94a3b8;
          transition: transform 0.3s ease;
        }

        .article-card:hover .article-arrow {
          transform: translateX(4px);
        }

        /* Article View */
        .article-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 30px;
        }

        .article-page-title {
          font-size: 1.6rem;
          font-weight: 700;
          color: #1e2761;
          margin: 0;
          line-height: 1.3;
        }

        .video-section {
          margin-bottom: 30px;
        }

        .video-placeholder {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 60px 20px;
          text-align: center;
          color: white;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .video-placeholder:hover {
          transform: scale(1.02);
        }

        .video-placeholder p {
          margin: 12px 0 0 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .article-content-section {
          background: white;
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .article-text {
          line-height: 1.7;
        }

        .content-heading {
          font-size: 1.3rem;
          font-weight: 700;
          color: #1e2761;
          margin: 24px 0 12px 0;
        }

        .content-heading:first-child {
          margin-top: 0;
        }

        .content-paragraph {
          margin: 0 0 16px 0;
          color: #374151;
          font-size: 1rem;
        }

        .content-list-item {
          margin: 8px 0;
          color: #374151;
          font-size: 1rem;
          list-style: none;
          position: relative;
          padding-left: 20px;
        }

        .content-list-item::before {
          content: "•";
          color: #ffd93d;
          font-weight: bold;
          position: absolute;
          left: 0;
        }

        /* Feedback Section */
        .feedback-section {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .feedback-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 0 0 30px 0;
        }

        .feedback-question h4 {
          margin: 0 0 20px 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: #1e2761;
          text-align: center;
        }

        .feedback-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .feedback-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .feedback-btn.yes {
          background: #10b981;
          color: white;
        }

        .feedback-btn.yes:hover {
          background: #059669;
          transform: translateY(-2px);
        }

        .feedback-btn.no {
          background: #ef4444;
          color: white;
        }

        .feedback-btn.no:hover {
          background: #dc2626;
          transform: translateY(-2px);
        }

        .feedback-response {
          text-align: center;
        }

        .feedback-success {
          color: #10b981;
        }

        .feedback-success h3 {
          margin: 16px 0 8px 0;
          font-size: 1.4rem;
          font-weight: 700;
        }

        .feedback-success p {
          margin: 0;
          color: #374151;
          font-size: 1rem;
        }

        .feedback-support {
          color: #6366f1;
        }

        .feedback-support h3 {
          margin: 16px 0 8px 0;
          font-size: 1.4rem;
          font-weight: 700;
          color: #1e2761;
        }

        .feedback-support p {
          margin: 0 0 24px 0;
          color: #374151;
          font-size: 1rem;
        }

        .support-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }

        .support-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 160px;
          justify-content: center;
        }

        .support-btn.chat {
          background: #6366f1;
          color: white;
        }

        .support-btn.chat:hover {
          background: #4f46e5;
          transform: translateY(-2px);
        }

        .support-btn.decline {
          background: #f8fafc;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        .support-btn.decline:hover {
          background: #f1f5f9;
          color: #475569;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .help-title {
            font-size: 2rem;
          }

          .category-page-title,
          .article-page-title {
            font-size: 1.4rem;
          }

          .article-content-section,
          .feedback-section {
            padding: 20px;
          }

          .feedback-buttons {
            flex-direction: column;
          }

          .feedback-btn {
            width: 100%;
            justify-content: center;
          }

          .support-actions {
            width: 100%;
          }

          .support-btn {
            width: 100%;
          }
        }
      `}
      </style>
    </div>
  );
};
export default Help;