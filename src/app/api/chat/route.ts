import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are VivaTrust Bank AI - the intelligent banking assistant. Respond directly and naturally as if you're a knowledgeable human agent.

KEY DIRECTIVES:
- Answer questions directly without unnecessary explanations
- Be conversational but professional
- Provide specific, actionable information
- Use natural human-like responses
- Focus on solving the user's immediate question

STYLE:
- Talk like a helpful bank representative
- Keep responses concise and to the point
- Use "I" and "you" naturally
- Avoid robotic or overly formal language`;

// Simple rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT = 15;
const RATE_LIMIT_WINDOW = 60000;

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  let requests = rateLimitMap.get(identifier) || [];
  requests = requests.filter((time: number) => time > windowStart);
  
  if (requests.length >= RATE_LIMIT) return false;
  
  requests.push(now);
  rateLimitMap.set(identifier, requests);
  return true;
}

// Direct response database - answers questions simply
const DIRECT_RESPONSES = [
  // === ACCOUNT QUESTIONS ===
  {
    patterns: [/account number|where.*account number/i],
    response: "You can find your account number on your dashboard or app, usually at the top of your account summary. If it's not visible, please complete your KYC verification."
  },
  {
    patterns: [/open.*account|create.*account/i],
    response: "You can open an account online in about 5 minutes. Click 'Open Account' on our website and follow the steps."
  },
  {
    patterns: [/close.*account/i],
    response: "To close your account, please visit support page or ontact agent via WhatsApp +16815054209. We'll help you through the process."
  },

  // === MONEY & TRANSFERS ===
  {
    patterns: [/withdraw|take out money/i],
    response: "Withdraw money anytime through your dashboard. Transfers typically complete within 1–2 business days."
  },
  {
    patterns: [/deposit|add money/i],
    response: "You can deposit funds via bank transfer, mobile check deposit, or at any VivaTrust Bank ATM."
  },
  {
    patterns: [/balance|how much money/i],
    response: "You can check your current balance anytime in your dashboard or mobile app."
  },
  {
    patterns: [/transfer money|send money/i],
    response: "To send money, go to 'Transfers' in your dashboard. You can transfer to other VivaTrust Bank accounts or external banks."
  },

  // === INVESTMENTS (GENERAL) ===
  {
    patterns: [/invest|investment/i],
    response: "We offer multiple investment options like container, property, and mutual funds. You can start investing from your dashboard with as little as $1,000."
  },
  {
    patterns: [/how much.*earn|roi|return/i],
    response: "Your ROI depends on the package you choose. Typical returns range from 8% to 15% annually."
  },
  {
    patterns: [/is.*safe|risk/i],
    response: "All investments are monitored and insured where applicable. We've maintained a 98% return success rate for the past 5 years."
  },

  // === PROPERTY INVESTMENT ===
  {
    patterns: [/property investment|real estate|house investment|land/i],
    response: "Our property investment options let you earn rental income or appreciation profits. Start from $10,000 with verified real estate partners."
  },
  {
    patterns: [/property.*roi|return.*property/i],
    response: "Property investments typically yield 10–14% annual returns depending on the location and market performance."
  },
  {
    patterns: [/buy.*property|invest.*real estate/i],
    response: "To invest in property, go to the 'Investments' tab in your dashboard and select 'Real Estate'."
  },
  {
    patterns: [/rent|rental income/i],
    response: "Yes, property investors earn monthly rental income which is automatically credited to your VivaTrust Bank account."
  },
  {
    patterns: [/property.*safe|risk/i],
    response: "All property investments are legally verified and insured against loss or damage."
  },

  // === CARDS ===
  {
    patterns: [/card|debit|credit/i],
    response: "We offer both debit and credit cards. You can apply through your dashboard — approval usually takes 2–3 minutes."
  },
  {
    patterns: [/card blocked|lost card/i],
    response: "If your card is lost or blocked, freeze it immediately from the app or WhatsApp +16815054209 for support."
  },
  {
    patterns: [/card limit|spending limit/i],
    response: "You can view or change your card limit from the 'Cards' section of your dashboard."
  },

  // === LOGIN & TECH SUPPORT ===
  {
    patterns: [/login|password|forgot/i],
    response: "Use the 'Forgot Password' link on the login page to reset your password safely."
  },
  {
    patterns: [/app|mobile|website/i],
    response: "Our mobile app has full online banking functionality. Download it from the App Store or Google Play."
  },
  {
    patterns: [/error|bug|technical|crash/i],
    response: "Sorry for the inconvenience! Try refreshing or reinstalling the app. If it persists, contact support theme"
  },

  // === LOANS & CREDIT ===
  {
    patterns: [/loan|borrow|credit/i],
    response: "You can apply for personal, car, or home loans directly from your dashboard. Approval takes about 24 hours."
  },
  {
    patterns: [/loan.*status/i],
    response: "To check your loan status, go to the 'Loans' section in your dashboard."
  },
  {
    patterns: [/interest rate/i],
    response: "Our current interest rates range between 4.5% and 8% depending on the loan type."
  },
  {
    patterns: [/credit score/i],
    response: "You can view your credit score in your profile under 'Financial Health'. We help you improve it too!"
  },
  {
    patterns: [/repay|loan payment/i],
    response: "To repay your loan, go to 'Loans' → 'Repay' in your dashboard. You can also set up auto-pay."
  },

  // === SAVINGS & ACCOUNTS ===
  {
    patterns: [/savings|save money/i],
    response: "Open a savings account to earn up to 5% annual interest. Withdraw anytime without penalty."
  },
  {
    patterns: [/interest.*savings/i],
    response: "Our savings account offers up to 5% APY depending on your balance and tenure."
  },
  {
    patterns: [/fixed deposit|fd/i],
    response: "Fixed deposits start from $1,000 and can earn up to 7% interest annually."
  },
  {
    patterns: [/joint account/i],
    response: "Yes, we support joint accounts. Both parties must complete KYC verification."
  },

  // === SECURITY ===
  {
    patterns: [/scam|fraud|unauthorized/i],
    response: "If you suspect fraud, freeze your account immediately and contact support"
  },
  {
    patterns: [/secure|safe/i],
    response: "We use 256-bit encryption and two-factor authentication to keep your account safe."
  },
  {
    patterns: [/otp|security code/i],
    response: "Security codes are sent to your registered phone or email within 2 minutes."
  },

  // === VERIFICATION ===
  {
    patterns: [/verify|verification|kyc/i],
    response: "Complete your KYC by uploading your ID and proof of address in your dashboard. It usually takes 10 minutes."
  },

  // === BUSINESS ACCOUNTS ===
  {
    patterns: [/business account|corporate account/i],
    response: "Open a business account to manage payments, payroll, and invoices in one place."
  },
  {
    patterns: [/merchant|payment gateway/i],
    response: "We provide merchant accounts and payment gateways for online stores. Apply from your dashboard."
  },

  // === CUSTOMER SUPPORT ===
  {
    patterns: [/contact|support|help|talk to someone/i],
    response: "Our support team is available 24/7 at support page or via WhatsApp +16815054209."
  },
  {
    patterns: [/complaint|feedback/i],
    response: "We're sorry to hear that! Please send your complaint or feedback to vivatrustbank@gmail.com."
  },

  // === GREETINGS & SMALL TALK ===
  {
    patterns: [/hello|hi|hey/i],
    response: "Hi! I'm VivaTrust Bank AI. How can I assist with your banking today?"
  },
  {
    patterns: [/how are you/i],
    response: "Doing great, thanks! Ready to help with your banking needs."
  },
  {
    patterns: [/what can you do/i],
    response: "I can help with accounts, loans, transfers, investments, and more. What do you need today?"
  },
  {
    patterns: [/thank/i],
    response: "You're welcome! Happy to help 😊"
  },
  {
    patterns: [/bye|goodbye|see you/i],
    response: "Goodbye! Thanks for banking with VivaTrust Bank."
  },

  // === ADDITIONAL ONLINE BANKING TOPICS (for 100+ coverage) ===
  { 
    patterns: [/exchange rate|currency/i], 
    response: "You can view live currency exchange rates in your dashboard." 
  },
  { 
    patterns: [/international transfer/i], 
    response: "International transfers take 1–3 business days depending on the destination bank." 
  },
  { 
    patterns: [/schedule payment|auto pay/i], 
    response: "You can schedule recurring payments in the 'Payments' section." 
  },
  { 
    patterns: [/download statement|bank statement/i], 
    response: "Download your bank statements anytime under 'Documents' in your dashboard." 
  },
  { 
    patterns: [/tax|1099|income report/i], 
    response: "We automatically generate tax documents each year in the 'Documents' tab." 
  },
  { 
    patterns: [/update email|update phone/i], 
    response: "You can update your contact info in your profile settings." 
  },
  { 
    patterns: [/account freeze|suspend account/i], 
    response: "You can temporarily freeze or reactivate your account from your dashboard." 
  },
  { 
    patterns: [/notification|alerts/i], 
    response: "Manage your SMS or email alerts under 'Settings' → 'Notifications'." 
  },
  { 
    patterns: [/referral|invite friend/i], 
    response: "Invite friends and earn bonuses! Find your referral link in your dashboard." 
  },
  { 
    patterns: [/currency conversion fee|transfer fee/i], 
    response: "Our transfer fees vary by country — typically 0.5–1% per transaction." 
  },
  { 
    patterns: [/atm|cash withdrawal/i], 
    response: "You can withdraw cash at any VivaTrust Bank ATM or partner ATM globally."
  },
  { 
    patterns: [/overdraft/i], 
    response: "Our overdraft protection automatically covers shortfalls up to your limit." 
  },
  { 
    patterns: [/pin change/i], 
    response: "Change your card PIN anytime under 'Card Settings' in the app." 
  },
  { 
    patterns: [/rewards|points|cashback/i], 
    response: "Earn cashback and points when you use your VivaTrust Bank card for purchases!"
  },
  { 
    patterns: [/insurance/i], 
    response: "We offer life, travel, and property insurance plans. Explore them in your dashboard." 
  },
  { 
    patterns: [/retirement|pension/i], 
    response: "Our retirement savings plans help you grow wealth long-term with tax advantages." 
  },
  { 
    patterns: [/education loan/i], 
    response: "Apply for an education loan easily under 'Loans' → 'Student Loan'." 
  },
  { 
    patterns: [/mortgage/i], 
    response: "We provide flexible mortgage options with low rates. Apply online to get pre-approved." 
  },
  { 
    patterns: [/crypto|bitcoin|ethereum/i], 
    response: "We now support crypto wallet linking! Manage your assets securely within your account." 
  },
  { 
    patterns: [/notifications off|mute alerts/i], 
    response: "Go to 'Settings' → 'Notifications' to turn alerts off or on." 
  },
  // === ADDITIONAL 100 COMMON BANKING QUESTIONS ===

  { patterns: [/minimum balance/i], response: "The minimum balance depends on your account type. For standard accounts, it’s $10." },
  { patterns: [/account inactive|dormant/i], response: "If your account is inactive for over 6 months, it may be marked dormant. Just make a small transaction to reactivate it." },
  { patterns: [/interest calculation/i], response: "Interest is calculated daily and credited monthly to your account." },
  { patterns: [/account statement date/i], response: "Statements are generated at the end of each month automatically." },
  { patterns: [/account upgrade/i], response: "You can upgrade your account in 'Settings' → 'Upgrade Plan' to access more benefits." },
  { patterns: [/account downgrade/i], response: "Downgrading is possible at any time through your dashboard settings." },
  { patterns: [/transaction limit/i], response: "Daily transfer limits depend on your verification level. Standard users can send up to $10,000/day." },
  { patterns: [/instant transfer/i], response: "Yes! Instant transfers between VivaTrust Bank users are available 24/7." },
  { patterns: [/transfer failed/i], response: "If a transfer failed, check if the recipient details are correct and your balance is sufficient." },
  { patterns: [/pending transfer/i], response: "Pending transfers are usually processed within 24 hours. Check the 'Transfers' tab for updates." },
  { patterns: [/cancel transfer/i], response: "Transfers can only be canceled if they haven’t been processed yet. Visit the 'Transfers' section quickly to cancel." },
  { patterns: [/schedule transfer/i], response: "You can schedule transfers for future dates under 'Transfers' → 'Schedule'." },
  { patterns: [/international fee/i], response: "International transfer fees are between 0.5–1.5% depending on the currency." },
  { patterns: [/swift code/i], response: "Our SWIFT code is KNGDXUS1. Use it for international wire transfers." },
  { patterns: [/iban/i], response: "Your IBAN is shown in your account summary and is used for international payments." },
  { patterns: [/exchange currency/i], response: "You can exchange currencies directly in your dashboard using live market rates." },
  { patterns: [/bank code|routing number/i], response: "Your routing number is displayed under 'Account Details' in your dashboard." },
  { patterns: [/deposit not showing/i], response: "Deposits usually reflect within minutes. If delayed, please wait up to 2 hours or contact support." },
  { patterns: [/deposit limit/i], response: "Deposit limits depend on your KYC level. Verified users can deposit up to $50,000 daily." },
  { patterns: [/direct deposit/i], response: "Yes, you can set up direct deposits from your employer. Use your VivaTrust Bank account and routing number." },
  { patterns: [/cash deposit/i], response: "Cash deposits can be made at any VivaTrust Bank partner ATM or local branch." },
  { patterns: [/mobile deposit|check deposit/i], response: "Deposit checks easily by taking a photo in the app under 'Deposit Check'." },
  { patterns: [/withdrawal limit/i], response: "Your daily withdrawal limit is shown in your account settings. You can request an increase anytime." },
  { patterns: [/atm fee/i], response: "We don’t charge ATM fees, but the local ATM provider might." },
  { patterns: [/card delivery/i], response: "Cards are delivered within 5–7 business days after approval." },
  { patterns: [/card not working/i], response: "Make sure your card is activated. If the issue continues, contact support." },
  { patterns: [/virtual card/i], response: "You can create a virtual debit card instantly from your dashboard for online use." },
  { patterns: [/card activation/i], response: "Activate your card by entering the last 4 digits in your app’s 'Card Activation' section." },
  { patterns: [/card renewal/i], response: "Cards are renewed automatically before expiry. A new one will be mailed to your address." },
  { patterns: [/card expired/i], response: "If your card expired, a replacement is automatically sent to your registered address." },
  { patterns: [/declined transaction/i], response: "Transactions may be declined due to insufficient funds or incorrect PIN. Check your app for details." },
  { patterns: [/unauthorized charge/i], response: "Freeze your card immediately and contact our 24/7 fraud team for investigation." },
  { patterns: [/cvv|security code card/i], response: "The CVV is the 3-digit number on the back of your card, used for secure online payments." },
  { patterns: [/pin forgot/i], response: "Reset your PIN easily in your app under 'Card Settings' → 'Reset PIN'." },
  { patterns: [/change address/i], response: "You can update your address in 'Profile' → 'Personal Information'." },
  { patterns: [/update details/i], response: "You can update your phone, address, or email anytime in your profile settings." },
  { patterns: [/open business account/i], response: "Open a business account online in 10 minutes. You'll need your company registration number and ID." },
  { patterns: [/close business account/i], response: "To close your business account, please contact business support at vivatrustbank@gmail.com." },
  { patterns: [/company verification/i], response: "Business accounts require company registration, tax ID, and proof of address." },
  { patterns: [/invoice|billing/i], response: "You can create and send invoices directly from your business dashboard." },
  { patterns: [/payment link/i], response: "Generate payment links instantly in your business account to receive payments easily." },
  { patterns: [/loan eligibility/i], response: "Your loan eligibility depends on your credit score and account activity." },
  { patterns: [/loan rejected/i], response: "If your loan was rejected, check your credit score and repayment history before reapplying." },
  { patterns: [/loan approval time/i], response: "Most loans are approved within 24–48 hours after verification." },
  { patterns: [/top up loan/i], response: "You can top up your existing loan once 50% of it has been repaid." },
  { patterns: [/loan statement/i], response: "Download your loan statement under 'Loans' → 'Statements' in your dashboard." },
  { patterns: [/credit limit/i], response: "Your credit limit is determined by your credit score and account history." },
  { patterns: [/increase credit limit/i], response: "To request a higher credit limit, go to 'Credit' → 'Limit Increase' in your app." },
  { patterns: [/reduce credit limit/i], response: "You can reduce your credit limit anytime under 'Credit Settings'." },
  { patterns: [/credit card interest/i], response: "Interest on unpaid balances is charged at 1.5% per month." },
  { patterns: [/credit history/i], response: "You can view your full credit history in your financial summary section." },
  { patterns: [/credit card bill/i], response: "Your credit card bill is generated monthly and viewable in the 'Cards' section." },
  { patterns: [/missed payment/i], response: "Missed payments may attract a late fee. Set up auto-pay to avoid this." },
  { patterns: [/early repayment/i], response: "You can repay your loan early anytime without penalties." },
  { patterns: [/late fee/i], response: "Late payment fees range between $10–$25 depending on the account type." },
  { patterns: [/loan calculator/i], response: "Use our online loan calculator to estimate monthly payments easily." },
  { patterns: [/mortgage pre approval/i], response: "You can get pre-approved for a mortgage in 5 minutes by submitting your income documents." },
  { patterns: [/home insurance/i], response: "We offer home insurance packages along with property investments. Check 'Insurance' in your app." },
  { patterns: [/investment plan/i], response: "We have multiple investment plans — container, property, and mutual fund packages starting from $500." },
  { patterns: [/dividend|profit share/i], response: "Dividends are credited quarterly to your account depending on your investment type." },
  { patterns: [/withdraw investment/i], response: "You can withdraw investments anytime after the maturity period from your dashboard." },
  { patterns: [/investment duration/i], response: "Most investment plans range from 6 months to 5 years depending on the package." },
  { patterns: [/investment portfolio/i], response: "You can view and track your full investment portfolio in the 'Investments' tab." },
  { patterns: [/compound interest/i], response: "Yes, some of our investment plans offer compound interest options for better returns." },
  { patterns: [/real estate location/i], response: "Our property investments are located in verified high-growth regions." },
  { patterns: [/property ownership proof/i], response: "All investors receive legal documentation confirming property ownership." },
  { patterns: [/rent payout date/i], response: "Rental income is paid on the 5th of each month directly to your account." },
  { patterns: [/withdrawal delay/i], response: "Withdrawal delays may occur due to bank verification. It should clear within 24 hours." },
  { patterns: [/login attempt limit/i], response: "After 5 failed login attempts, your account locks for 30 minutes for security." },
  { patterns: [/two factor|2fa/i], response: "Enable two-factor authentication in your app for enhanced security." },
  { patterns: [/biometric login/i], response: "You can enable fingerprint or face ID login in the mobile app settings." },
  { patterns: [/security question/i], response: "Security questions add an extra layer of account protection." },
  { patterns: [/phishing|spam email/i], response: "Never click links from suspicious emails. We’ll never ask for your password." },
  { patterns: [/update password/i], response: "You can update your password anytime under 'Account Settings' → 'Security'." },
  { patterns: [/email not received/i], response: "Check your spam or promotions folder. If still missing, resend from your dashboard." },
  { patterns: [/notification not received/i], response: "Make sure notifications are enabled in both the app and phone settings." },
  { patterns: [/open hours|working hours/i], response: "Our digital services run 24/7, and customer support is always available." },
  { patterns: [/branch location/i], response: "We’re fully online, but partner branches are listed under 'Find Us' in your app." },
  { patterns: [/atm nearby/i], response: "Find the nearest VivaTrust Bank ATM in your app under 'ATM Locator'." },
  { patterns: [/supported countries/i], response: "We currently operate in over 40 countries worldwide." },
  { patterns: [/currency supported/i], response: "We support USD, EUR, GBP, and several local currencies." },
  { patterns: [/contact ceo|manager/i], response: "For executive inquiries, please email vivatrustbank@gmail.com" },
  { patterns: [/bank license|regulated/i], response: "Yes, VivaTrust Bank is a fully licensed and regulated financial institution." },
  { patterns: [/terms|privacy policy/i], response: "You can view our terms and privacy policy at VivaTrust Bank.com/legal." },
  { patterns: [/fees|charges/i], response: "Our fee schedule is transparent and listed under 'Pricing' in your dashboard." },
  { patterns: [/cancel subscription/i], response: "Cancel any paid plan in 'Settings' → 'Subscription' anytime." },
  { patterns: [/update app/i], response: "Keep your app updated to enjoy the latest features and improvements." },
  { patterns: [/currency account/i], response: "You can open multi-currency accounts directly from your dashboard." },
  { patterns: [/student account/i], response: "We offer student-friendly accounts with no minimum balance and low fees." },
  { patterns: [/travel card/i], response: "Our travel card allows global use with zero foreign transaction fees." },
  { patterns: [/report issue/i], response: "You can report any issue through 'Help' → 'Report a Problem' in your app." },
  { patterns: [/app update failed/i], response: "Try reinstalling the app or checking your internet connection before retrying." },
  { patterns: [/reset settings/i], response: "You can reset app settings in 'Settings' → 'Advanced'." },
  { patterns: [/budget planner/i], response: "Our budget planner tool helps you manage spending and savings goals easily." },
  { patterns: [/goal saving/i], response: "You can set personal saving goals in your account and track your progress." },
  { patterns: [/cashback redeem/i], response: "Redeem your cashback anytime from 'Rewards' → 'Redeem'." },
  { patterns: [/bonus points/i], response: "You earn points on every purchase — view them in 'Rewards' → 'Points'." },
  { patterns: [/exchange wallet|multi wallet/i], response: "You can create multiple currency wallets under 'Wallets' in your account." },
  { patterns: [/crypto wallet/i], response: "You can link your crypto wallet securely under 'Assets' in the app." },
  { patterns: [/help center/i], response: "Visit our in-app Help Center for tutorials, FAQs, and live chat support." },
  { patterns: [/newsletter/i], response: "Subscribe to our newsletter for financial tips and updates from VivaTrust Bank." },
];


function getDirectResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  for (const item of DIRECT_RESPONSES) {
    for (const pattern of item.patterns) {
      if (pattern.test(lowerMessage)) {
        return item.response;
      }
    }
  }

  // Smart fallbacks for common question types
  if (lowerMessage.includes('?')) {
    if (lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('where')) {
      return "I can help with that. Could you give me a bit more detail about what you're looking for?";
    }
  }

  return "I'm not sure I understand. Could you rephrase that? I'm here to help with accounts, transfers, investments, or any banking questions.";
}

async function callOpenAI(messages: any[]): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.slice(-3),
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    return data.choices[0]?.message?.content || null;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

export async function POST(req: Request) {
  const identifier = req.headers.get('x-forwarded-for') || 'anonymous';
  
  if (!checkRateLimit(identifier)) {
    return NextResponse.json({
      reply: "Please wait a moment before sending another message."
    });
  }

  try {
    const { messages } = await req.json();
    const lastMessage = messages?.[messages.length - 1]?.content || '';

    if (!lastMessage.trim()) {
      return NextResponse.json({
        reply: "Hi! I'm VivaTrust Bank AI. How can I help you today?"
      });
    }

    // Always try direct response first - it's faster and more reliable
    const directResponse = getDirectResponse(lastMessage);
    
    // Only use OpenAI for complex conversations that need context
    if (messages.length > 2) {
      try {
        const aiResponse = await callOpenAI(messages);
        if (aiResponse) {
          return NextResponse.json({ 
            reply: aiResponse,
            source: "ai"
          });
        }
      } catch {
        // Fall through to direct response
      }
    }

    return NextResponse.json({ 
      reply: directResponse,
      source: "direct"
    });

  } catch (error) {
    const { messages } = await req.json().catch(() => ({ messages: [] }));
    const lastMessage = messages?.[messages.length - 1]?.content || '';
    
    const fallbackResponse = getDirectResponse(lastMessage);
    return NextResponse.json({
      reply: fallbackResponse
    });
  }
}

// Cleanup every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, times] of rateLimitMap.entries()) {
    rateLimitMap.set(key, times.filter((time: number) => time > now - 60000));
  }
}, 600000);
